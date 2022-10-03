import * as lodash from 'lodash';
import { Connection, createPool, ResultSetHeader } from 'mysql2';
import { actionQuery, actionExecute } from '../database/curd-decorator';
import { config, log } from "../speed";
const db_instances = {}

export default class Model {

    public page = null;
    private table: string;

    constructor(table?: string) {
        if (table) this.table = table;
    }

    async find<T>(conditions, _sort?, fields = '*', limit = undefined): Promise<T[]> {
        let sort = _sort ? ' ORDER BY ' + _sort : '';
        const { sql, values } = this.where(conditions);
        let newSql = 'SELECT ' + fields + ' FROM ' + this.table + ' WHERE ' + sql + sort;
        if (limit === undefined || typeof limit === 'string') {
            newSql += (limit === undefined) ? '' : ' LIMIT ' + limit
        }
        // else {
        //     let total = await this.query('SELECT COUNT(*) AS M_COUNTER ' + sql, params)
        //     if (!total[0]['M_COUNTER'] || total[0]['M_COUNTER'] == 0) return false
        //     limit = lodash.merge([1, 10, 10], _limit)
        //     limit = this.pager(limit[0], limit[1], limit[2], total[0]['M_COUNTER'])
        //     limit = lodash.isEmpty(limit) ? '' : ' LIMIT ' + limit['offset'] + ',' + limit['limit']
        // }
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

    async findOne<T>(conditions, sort, fields = '*'): Promise<T> {
        let res = await this.find(conditions, sort, fields, 1);
        return res.length > 0 ? <T>res[0] : null;
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




