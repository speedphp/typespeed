"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = exports.cache = exports.resultType = exports.param = exports.select = exports.remove = exports.update = exports.insert = void 0;
const core_decorator_1 = require("./core.decorator");
const cache_factory_class_1 = require("./factory/cache-factory.class");
const data_source_factory_class_1 = require("./factory/data-source-factory.class");
const paramMetadataKey = Symbol('param');
const resultTypeMap = new Map();
const cacheDefindMap = new Map();
const tableVersionMap = new Map();
let cacheBean;
function insert(sql) {
    return (target, propertyKey, descriptor) => {
        descriptor.value = async (...args) => {
            const result = await queryForExecute(sql, args, target, propertyKey);
            if (cacheBean && result.affectedRows > 0) {
                const [tableName, tableVersion] = getTableAndVersion("insert", sql);
                tableVersionMap.set(tableName, tableVersion + 1);
            }
            return result.insertId;
        };
    };
}
exports.insert = insert;
function update(sql) {
    return (target, propertyKey, descriptor) => {
        descriptor.value = async (...args) => {
            const result = await queryForExecute(sql, args, target, propertyKey);
            if (cacheBean && result.affectedRows > 0) {
                const [tableName, tableVersion] = getTableAndVersion("update", sql);
                tableVersionMap.set(tableName, tableVersion + 1);
            }
            return result.affectedRows;
        };
    };
}
exports.update = update;
function remove(sql) {
    return (target, propertyKey, descriptor) => {
        descriptor.value = async (...args) => {
            const result = await queryForExecute(sql, args, target, propertyKey);
            if (cacheBean && result.affectedRows > 0) {
                const [tableName, tableVersion] = getTableAndVersion("delete", sql);
                tableVersionMap.set(tableName, tableVersion + 1);
            }
            return result.affectedRows;
        };
    };
}
exports.remove = remove;
function select(sql) {
    return (target, propertyKey, descriptor) => {
        descriptor.value = async (...args) => {
            const [newSql, sqlValues] = convertSQLParams(sql, target, propertyKey, args);
            const resultType = resultTypeMap.get([target.constructor.name, propertyKey].toString());
            if (cacheBean && cacheDefindMap.has([target.constructor.name, propertyKey].toString())) {
                const [tableName, tableVersion] = getTableAndVersion("select", newSql);
                const cacheKey = JSON.stringify([tableName, tableVersion, newSql, sqlValues]);
                if (cacheBean.get(cacheKey)) {
                    return cacheBean.get(cacheKey);
                }
                else {
                    const rows = await actionQuery(newSql, sqlValues, resultType);
                    cacheBean.set(cacheKey, rows, cacheDefindMap.get([target.constructor.name, propertyKey].toString()));
                    return rows;
                }
            }
            else {
                return await actionQuery(newSql, sqlValues, resultType);
            }
        };
    };
}
exports.select = select;
function resultType(dataClass) {
    return function (target, propertyKey) {
        resultTypeMap.set([target.constructor.name, propertyKey].toString(), new dataClass());
        //never return
    };
}
exports.resultType = resultType;
function param(name) {
    return function (target, propertyKey, parameterIndex) {
        const existingParameters = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];
        existingParameters.push([name, parameterIndex]);
        Reflect.defineMetadata(paramMetadataKey, existingParameters, target, propertyKey);
    };
}
exports.param = param;
async function queryForExecute(sql, args, target, propertyKey) {
    const [newSql, sqlValues] = convertSQLParams(sql, target, propertyKey, args);
    return actionExecute(newSql, sqlValues);
}
async function actionExecute(newSql, sqlValues) {
    const writeConnection = await (0, core_decorator_1.getBean)(data_source_factory_class_1.default).writeConnection();
    const [result] = await writeConnection.query(newSql, sqlValues);
    return result;
}
async function actionQuery(newSql, sqlValues, dataClassType) {
    const readConnection = await (0, core_decorator_1.getBean)(data_source_factory_class_1.default).readConnection();
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
function convertSQLParams(decoratorSQL, target, propertyKey, args) {
    const queryValues = [];
    if (args.length > 0) {
        let argsVal;
        if (typeof args[0] === 'object') {
            argsVal = new Map(Object.getOwnPropertyNames(args[0]).map((valName) => [valName, args[0][valName]]));
        }
        else {
            const existingParameters = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey);
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
function cache(ttl) {
    return function (target, propertyKey) {
        cacheDefindMap.set([target.constructor.name, propertyKey].toString(), ttl);
        if (cacheBean == null) {
            const cacheFactory = (0, core_decorator_1.getBean)(cache_factory_class_1.default);
            if (cacheFactory || cacheFactory["factory"]) {
                cacheBean = cacheFactory["factory"];
            }
        }
    };
}
exports.cache = cache;
function getTableAndVersion(name, sql) {
    const regExpMap = {
        insert: /insert\sinto\s+([\w`\'\"]+)/i,
        update: /update\s+([\w`\'\"]+)/i,
        delete: /delete\sfrom\s+([\w`\'\"]+)/i,
        select: /\s+from\s+([\w`\'\"]+)/i
    };
    const macths = sql.match(regExpMap[name]);
    if (macths && macths.length > 1) {
        const tableName = macths[1].replace(/[`\'\"]/g, "");
        const tableVersion = tableVersionMap.get(tableName) || 1;
        tableVersionMap.set(tableName, tableVersion);
        (0, core_decorator_1.log)(tableVersionMap);
        return [tableName, tableVersion];
    }
    else {
        throw new Error("can not find table name");
    }
}
class Model {
    constructor(table) {
        this.page = null;
        if (table)
            this.table = table;
    }
    async findAll(conditions, sort = '', fields = '*', limit) {
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
            newSql += ' LIMIT ' + limit;
        }
        else if (typeof limit === 'object') {
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
        return await actionQuery(newSql, values);
    }
    async create(rows) {
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
        const result = await actionExecute(newSql, values);
        return result.insertId;
    }
    async find(conditions, sort, fields = '*') {
        const result = await this.findAll(conditions, sort, fields, 1);
        return result.length > 0 ? result[0] : null;
    }
    async update(conditions, fieldToValues) {
        const { sql, values } = this.where(conditions);
        const newSql = 'UPDATE ' + this.table + ' SET ' + Object.keys(fieldToValues).map((field) => { return '`' + field + '` = ? '; }).join(', ') + ' WHERE ' + sql;
        const result = await actionExecute(newSql, Object.values(fieldToValues).concat(values));
        return result.affectedRows;
    }
    async delete(conditions) {
        const { sql, values } = this.where(conditions);
        const newSql = 'DELETE FROM ' + this.table + ' WHERE ' + sql;
        const result = await actionExecute(newSql, values);
        return result.affectedRows;
    }
    async findCount(conditions) {
        const { sql, values } = this.where(conditions);
        const newSql = 'SELECT COUNT(*) AS M_COUNTER FROM ' + this.table + ' WHERE ' + sql;
        const result = await actionQuery(newSql, values);
        return result[0]['M_COUNTER'] || 0;
    }
    async incr(conditions, field, optval = 1) {
        const { sql, values } = this.where(conditions);
        const newSql = 'UPDATE ' + this.table + ' SET `' + field + '` = `' + field + '` + ? WHERE ' + sql;
        values.unshift(optval); // increase at the top
        const result = await actionExecute(newSql, values);
        return result.affectedRows;
    }
    async decr(conditions, field, optval = 1) {
        return await this.incr(conditions, field, -optval);
    }
    pager(page, total, pageSize = 10, scope = 10) {
        this.page = null;
        if (total === undefined)
            throw new Error('Pager total would not be undefined');
        if (total > pageSize) {
            let totalPage = Math.ceil(total / pageSize);
            page = Math.min(Math.max(page, 1), total);
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
            };
            if (totalPage <= scope) {
                this.page.allPages = this.range(1, totalPage);
            }
            else if (page <= scope / 2) {
                this.page.allPages = this.range(1, scope);
            }
            else if (page <= totalPage - scope / 2) {
                let right = page + (scope / 2);
                this.page.allPages = this.range(right - scope + 1, right);
            }
            else {
                this.page.allPages = this.range(totalPage - scope + 1, totalPage);
            }
        }
        return this.page;
    }
    where(conditions) {
        const result = { sql: '', values: [] };
        if (typeof conditions === 'object') {
            Object.keys(conditions).map((field) => {
                if (result["sql"].length > 0) {
                    result["sql"] += " AND ";
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
                    }
                    else {
                        const operatorTemplate = { $lt: "<", $lte: "<=", $gt: ">", $gte: ">=", $ne: "!=", $like: "LIKE" };
                        let firstCondition = Object.keys(conditions[field]).length > 1;
                        Object.keys(conditions[field]).map((operator) => {
                            if (operatorTemplate[operator]) {
                                const operatorValue = operatorTemplate[operator];
                                result["sql"] += ` ${field} ${operatorValue} ? ` + (firstCondition ? " AND " : "");
                                result["values"].push(conditions[field][operator]);
                                firstCondition = false;
                            }
                        });
                    }
                }
                else {
                    result["sql"] += ` ${field} = ? `;
                    result["values"].push(conditions[field]);
                }
            });
        }
        else {
            result["sql"] = conditions;
        }
        return result;
    }
    range(start, end) {
        return [...Array(end - start + 1).keys()].map(i => i + start);
    }
}
exports.Model = Model;
//# sourceMappingURL=database.decorator.js.map