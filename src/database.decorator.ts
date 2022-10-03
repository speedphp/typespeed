import { createPool, ResultSetHeader } from 'mysql2';
import { config, log, getBean } from './speed';
import CacheFactory from './factory/cache-factory.class';
import DataSourceFactory from './factory/data-source-factory.class';

const pool = createPool(config("mysql")).promise();
const paramMetadataKey = Symbol('param');
const resultTypeMap = new Map<string, object>();
const cacheDefindMap = new Map<string, number>();
const tableVersionMap = new Map<string, number>();
let cacheBean: CacheFactory;

function insert(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql, args, target, propertyKey);
            if (cacheBean && result.affectedRows > 0) {
                const [tableName, tableVersion] = getTableAndVersion("insert", sql);
                tableVersionMap.set(tableName, tableVersion + 1);
            }
            return result.insertId;
        };
    };
}

function update(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql, args, target, propertyKey);
            if (cacheBean && result.affectedRows > 0) {
                const [tableName, tableVersion] = getTableAndVersion("update", sql);
                tableVersionMap.set(tableName, tableVersion + 1);
            }
            return result.affectedRows;
        };
    };
}

function remove(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql, args, target, propertyKey);
            if (cacheBean && result.affectedRows > 0) {
                const [tableName, tableVersion] = getTableAndVersion("delete", sql);
                tableVersionMap.set(tableName, tableVersion + 1);
            }
            return result.affectedRows;
        };
    };
}

function select(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            const [newSql, sqlValues] = convertSQLParams(sql, target, propertyKey, args);
            const resultType = resultTypeMap.get([target.constructor.name, propertyKey].toString());
            if (cacheBean && cacheDefindMap.has([target.constructor.name, propertyKey].toString())) {
                const [tableName, tableVersion] = getTableAndVersion("select", newSql);
                const cacheKey = JSON.stringify([tableName, tableVersion, newSql, sqlValues]);
                if (cacheBean.get(cacheKey)) {
                    return cacheBean.get(cacheKey);
                } else {
                    const rows = await actionQuery(newSql, sqlValues, resultType);
                    cacheBean.set(cacheKey, rows, cacheDefindMap.get([target.constructor.name, propertyKey].toString()));
                    return rows;
                }
            } else {
                return await actionQuery(newSql, sqlValues, resultType);
            }
        };
    }
}

function resultType(dataClass) {
    return function (target, propertyKey: string) {
        resultTypeMap.set([target.constructor.name, propertyKey].toString(), new dataClass());
        //never return
    };
}

function param(name: string) {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        const existingParameters: [string, number][] = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];
        existingParameters.push([name, parameterIndex]);
        Reflect.defineMetadata(paramMetadataKey, existingParameters, target, propertyKey);
    };
}

async function queryForExecute(sql: string, args: any[], target, propertyKey: string): Promise<ResultSetHeader> {
    const [newSql, sqlValues] = convertSQLParams(sql, target, propertyKey, args);
    return actionExecute(newSql, sqlValues);
}

async function actionExecute(newSql, sqlValues): Promise<ResultSetHeader> {
    const writeConnection = await getBean(DataSourceFactory).writeConnection();
    const [result] = await writeConnection.query(newSql, sqlValues);
    return <ResultSetHeader>result;
}

async function actionQuery(newSql, sqlValues, dataClassType?) {
    const readConnection = await getBean(DataSourceFactory).readConnection();
    const [rows] = await readConnection.query(newSql, sqlValues);
    if (rows === null || Object.keys(rows).length === 0 || !dataClassType) {
        return rows;
    }
    const records = [];
    for (const rowIndex in rows) {
        const entity = new dataClassType();
        Object.getOwnPropertyNames(entity).forEach((propertyRow) => {
            if (rows[rowIndex].hasOwnProperty(propertyRow)) {
                Object.defineProperty(entity, propertyRow, Object.getOwnPropertyDescriptor(rows[rowIndex], propertyRow));
            }
        });
        records.push(entity);
    }
    return records;
}

function convertSQLParams(decoratorSQL: string, target: any, propertyKey: string, args: any[]): [string, any[]] {
    const queryValues = [];
    if (args.length > 0) {
        let argsVal;
        if (typeof args[0] === 'object') {
            argsVal = new Map(Object.getOwnPropertyNames(args[0]).map((valName) => [valName, args[0][valName]]));
        } else {
            const existingParameters: [string, number][] = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey,);
            argsVal = new Map(existingParameters.map(([argName, argIdx]) => [argName, args[argIdx]]));
        }
        const regExp = /#{(\w+)}/;
        let match;
        while (match = regExp.exec(decoratorSQL)) {
            const [replaceTag, matchName] = match;
            decoratorSQL = decoratorSQL.replace(new RegExp(replaceTag, 'g'), '?');
            queryValues.push(argsVal.get(matchName));
        }
    }
    return [decoratorSQL, queryValues];
}

function cache(ttl: number) {
    return function (target: any, propertyKey: string) {
        cacheDefindMap.set([target.constructor.name, propertyKey].toString(), ttl);
        if (cacheBean == null) {
            const cacheFactory = getBean(CacheFactory);
            if (cacheFactory || cacheFactory["factory"]) {
                cacheBean = cacheFactory["factory"];
            }
        }
        log(cacheDefindMap);
    }
}

function getTableAndVersion(name: string, sql: string): [string, number] {
    const regExpMap = {
        insert: /insert\sinto\s+([\w`\'\"]+)/i,
        update: /update\s+([\w`\'\"]+)/i,
        delete: /delete\sfrom\s+([\w`\'\"]+)/i,
        select: /\s+from\s+([\w`\'\"]+)/i
    }
    const macths = sql.match(regExpMap[name]);
    if (macths && macths.length > 1) {
        const tableName = macths[1].replace(/[`\'\"]/g, "");
        const tableVersion = tableVersionMap.get(tableName) || 1;
        tableVersionMap.set(tableName, tableVersion);
        log(tableVersionMap);
        return [tableName, tableVersion];
    } else {
        throw new Error("can not find table name");
    }
}


class Model {

    public page = null;
    private table: string;

    constructor(table?: string) {
        if (table) this.table = table;
    }

    async findAll<T>(conditions: object | string, sort: string | object = '', fields: string | [string] = '*', limit?: number | object): Promise<T[]> {
        const { sql, values } = this.where(conditions);
        if (typeof fields !== 'string') {
            fields = fields.join(", ");
        }
        if (typeof sort !== 'string') {
            sort = Object.keys(sort).map(s => {
                return s + (sort[s] === 1 ? " ASC" : " DESC");
            }).join(", ");
        }
        let newSql = 'SELECT ' + fields + ' FROM ' + this.table + ' WHERE ' + sql + " ORDER BY " + sort;
        if (typeof limit === 'number') {
            newSql += ' LIMIT ' + limit
        } else if (typeof limit === 'object') {
            const total = await actionQuery('SELECT COUNT(*) AS M_COUNTER  FROM ' + this.table + ' WHERE ' + sql, values);
            if (total === undefined || total[0]['M_COUNTER'] === 0) {
                return [];
            }
            if (limit['pageSize'] !== undefined && limit['pageSize'] < total[0]['M_COUNTER']) {
                const pager = this.pager(limit["page"] || 1, total[0]['M_COUNTER'], limit["pageSize"] || 10, limit["scope"] || 10);
                newSql += ' LIMIT ' + pager['offset'] + ',' + pager['limit'];
                this.page = pager;
            }
        }
        return <T[]>await actionQuery(newSql, values);
    }

    async create(rows): Promise<number> {
        let newSql = "";
        let values = [];
        if (!Array.isArray(rows)) {
            rows = [rows];
        }
        const firstRow = rows[0];
        newSql += 'INSERT INTO ' + this.table + ' (' + Object.keys(firstRow).map((field) => '`' + field + '`').join(', ') + ') VALUES';
        rows.forEach((row) => {
            const valueRow = [];
            Object.keys(row).map((field) => {
                values.push(row[field]);
                valueRow.push('?');
            });
            newSql += '(' + valueRow.map((value) => '?').join(', ') + ')' + (rows.indexOf(row) === rows.length - 1 ? '' : ',');
        });
        const result: ResultSetHeader = await actionExecute(newSql, values);
        return result.insertId;
    }

    async find<T>(conditions, sort, fields = '*'): Promise<T> {
        const result = await this.findAll(conditions, sort, fields, 1);
        return result.length > 0 ? <T>result[0] : null;
    }

    async update(conditions, fieldToValues): Promise<number> {
        const { sql, values } = this.where(conditions);
        const newSql = 'UPDATE ' + this.table + ' SET ' + Object.keys(fieldToValues).map((field) => { return '`' + field + '` = ? ' }).join(', ') + ' WHERE ' + sql;
        const result: ResultSetHeader = await actionExecute(newSql, Object.values(fieldToValues).concat(values));
        return result.affectedRows;
    }

    async delete(conditions): Promise<number> {
        const { sql, values } = this.where(conditions);
        const newSql = 'DELETE FROM ' + this.table + ' WHERE ' + sql;
        const result: ResultSetHeader = await actionExecute(newSql, values);
        return result.affectedRows;
    }

    async findCount(conditions): Promise<number> {
        const { sql, values } = this.where(conditions);
        const newSql = 'SELECT COUNT(*) AS M_COUNTER FROM ' + this.table + ' WHERE ' + sql;
        const result = await actionQuery(newSql, values);
        return result[0]['M_COUNTER'] || 0;
    }

    async incr(conditions, field, optval = 1): Promise<number> {
        const { sql, values } = this.where(conditions);
        const newSql = 'UPDATE ' + this.table + ' SET `' + field + '` = `' + field + '` + ? WHERE ' + sql;
        values.unshift(optval); // increase at the top
        const result: ResultSetHeader = await actionExecute(newSql, values);
        return result.affectedRows;
    }

    async decr(conditions, field, optval = 1): Promise<number> {
        return await this.incr(conditions, field, -optval);
    }

    pager(page, total, pageSize = 10, scope = 10) {
        this.page = null
        if (total === undefined) throw new Error('Pager total would not be undefined')
        if (total > pageSize) {
            let totalPage = Math.ceil(total / pageSize)
            page = Math.min(Math.max(page, 1), total)
            this.page = {
                'total': total,
                'pageSize': pageSize,
                'totalPage': totalPage,
                'firstPage': 1,
                'prevPage': ((1 == page) ? 1 : (page - 1)),
                'nextPage': ((page == totalPage) ? totalPage : (page + 1)),
                'lastPage': totalPage,
                'currentPage': page,
                'allPages': [],
                'offset': (page - 1) * pageSize,
                'limit': pageSize
            }
            if (totalPage <= scope) {
                this.page.allPages = this.range(1, totalPage)
            } else if (page <= scope / 2) {
                this.page.allPages = this.range(1, scope)
            } else if (page <= totalPage - scope / 2) {
                let right = page + (scope / 2)
                this.page.allPages = this.range(right - scope + 1, right)
            } else {
                this.page.allPages = this.range(totalPage - scope + 1, totalPage)
            }
        }
        return this.page
    }

    private where(conditions: object | string): { sql: string, values: any[] } {
        const result = { sql: '', values: [] };
        if (typeof conditions === 'object') {
            Object.keys(conditions).map((field) => {
                if (result["sql"].length > 0) {
                    result["sql"] += " AND "
                }
                if (typeof conditions[field] === 'object') {
                    if (field === '$or') {
                        let orSql = "";
                        conditions[field].map((item) => {
                            const { sql, values } = this.where(item);
                            orSql += (orSql.length > 0 ? " OR " : "") + `(${sql})`;
                            result["values"] = result["values"].concat(values);
                        });
                        result["sql"] += `(${orSql})`;
                    } else {
                        const operatorTemplate = { $lt: "<", $lte: "<=", $gt: ">", $gte: ">=", $ne: "!=", $like: "LIKE" };
                        let firstCondition: boolean = Object.keys(conditions[field]).length > 1;
                        Object.keys(conditions[field]).map((operator) => {
                            if (operatorTemplate[operator]) {
                                const operatorValue = operatorTemplate[operator];
                                result["sql"] += ` ${field} ${operatorValue} ? ` + (firstCondition ? " AND " : "");
                                result["values"].push(conditions[field][operator]);
                                firstCondition = false;
                            }
                        });
                    }
                } else {
                    result["sql"] += ` ${field} = ? `;
                    result["values"].push(conditions[field]);
                }
            });
        } else {
            result["sql"] = conditions;
        }
        return result
    }

    private range(start, end) {
        return [...Array(end - start + 1).keys()].map(i => i + start);
    }
}

export { insert, update, remove, select, param, resultType, cache, Model };