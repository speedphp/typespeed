import * as lodash from 'lodash';
import { Connection, createPool, ResultSetHeader } from 'mysql2';
import { actionQuery, actionExecute } from '../database/curd-decorator';
import { config, log } from "../speed";
const db_instances = {}

export default class Model {

    private _page;
    private table: string;

    constructor(table?: string) {
        if (table) this.table = table;
        this._page = null;
    }

    get page() {
        return this._page
    }

    async find<T>(conditions, _sort = '', fields = '*', limit = undefined): Promise<T[]> {
        let sort = _sort ? ' ORDER BY ' + _sort : '';
        const { sql, values } = this.where(conditions);
        log(sql)
        log(values)
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
        return <T[]> await actionQuery(newSql, values);
    }

    // async create(row) {
    //     let sql = 'INSERT INTO ' + this.tableName
    //         + ' (' + Object.keys(row).map((k) => '`' + k + '`').join(', ')
    //         + ') VALUES (' + Object.keys(row).map((k) => ':' + k).join(', ')
    //         + ')'
    //     let res = await this.execute(sql, row)
    //     return res
    // }

    // async find(conditions, _sort, fields = '*') {
    //     let res = await this.findAll(conditions, _sort, fields, 1)
    //     return !lodash.isEmpty(res) ? res[0] : false
    // }

    // async update(conditions, row) {
    //     let [where, params] = this._where(conditions)
    //     let values = {}
    //     let sql = 'UPDATE ' + this.tableName
    //         + ' SET ' + lodash.map(row, (v, k) => {
    //             values[k] = v
    //             return '`' + k + '` = :' + k
    //         }).join(', ')
    //         + where
    //     let res = await this.execute(sql, lodash.merge(params, values))
    //     return res
    // }

    // async delete(conditions) {
    //     let [where, params] = this._where(conditions)
    //     let res = await this.execute('DELETE FROM ' + this.tableName + where, params)
    //     return res
    // }

    // async findCount(conditions) {
    //     let [where, params] = this._where(conditions)
    //     let res = await this.query('SELECT COUNT(*) AS M_COUNTER FROM ' + this.tableName + where, params)
    //     return res[0]['M_COUNTER'] || 0
    // }

    // async incr(conditions, field, optval = 1) {
    //     let [where, params] = this._where(conditions)
    //     let sql = 'UPDATE ' + this.tableName + ' SET `' + field + '` = `'
    //         + field + '` + :M_INCR_VAL' + where
    //     let res = await this.execute(sql, lodash.merge(params, { 'M_INCR_VAL': optval }))
    //     return res
    // }

    // decr(conditions, field, optval = 1) {
    //     return this.incr(conditions, field, -optval)
    // }

    // pager(page, pageSize = 10, scope = 10, total) {
    //     this._page = null
    //     if (total === undefined) throw new Error('Pager total would not be undefined')
    //     if (total > pageSize) {
    //         let totalPage = Math.ceil(total / pageSize)
    //         page = Math.min(Math.max(page, 1), total)
    //         this._page = {
    //             'total_count': total,
    //             'pageSize': pageSize,
    //             'totalPage': totalPage,
    //             'firstPage': 1,
    //             'prevPage': ((1 == page) ? 1 : (page - 1)),
    //             'nextPage': ((page == totalPage) ? totalPage : (page + 1)),
    //             'lastPage': totalPage,
    //             'currentPage': page,
    //             'allPages': [],
    //             'offset': (page - 1) * pageSize,
    //             'limit': pageSize
    //         }
    //         if (totalPage <= scope) {
    //             this._page.allPages = lodash.range(1, totalPage)
    //         } else if (page <= scope / 2) {
    //             this._page.allPages = lodash.range(1, scope)
    //         } else if (page <= totalPage - scope / 2) {
    //             let right = page + (scope / 2)
    //             this._page.allPages = lodash.range(right - scope + 1, right)
    //         } else {
    //             this._page.allPages = lodash.range(totalPage - scope + 1, totalPage)
    //         }
    //     }
    //     return this._page
    // }

    // _where(conditions) {
    //     let result = [" ", {}]
    //     if (typeof conditions === 'object' && !lodash.isEmpty(conditions)) {
    //         let sql = null
    //         if (conditions['where'] !== undefined) {
    //             sql = conditions['where']
    //             conditions['where'] = undefined
    //         }
    //         if (!sql) sql = Object.keys(conditions).map((k) => '`' + k + '` = :' + k).join(" AND ")
    //         result[0] = " WHERE " + sql
    //         result[1] = conditions
    //     }
    //     return result
    // }

    // query(_sql, _values) {
    //     return this.execute(_sql, _values, true)
    // }

    // async execute(_sql, _values, readonly = false) {
    //     let connection: Connection;
    //     const mysqlConfig = config("mysql");
    //     if (readonly === true && mysqlConfig.slave !== undefined) {
    //         let instanceKey = Math.floor(Math.random() * (mysqlConfig.slave.length))
    //         connection = await this._db_instance(mysqlConfig.slave[instanceKey], 'slave_' + instanceKey)
    //     } else {
    //         connection = await this._db_instance(mysqlConfig, 'master')
    //     }
    //     let sql = connection.format(_sql, _values)
    //     return await connection.query(sql);
    // }

    // async _db_instance(db_config, instance_key) {
    //     if (db_instances[instance_key] === undefined) {
    //         db_config.queryFormat = function (query, values) {
    //             if (!values) return query
    //             return query.replace(/\:(\w+)/g, function (txt, key) {
    //                 if (values.hasOwnProperty(key)) {
    //                     return this.escape(values[key])
    //                 }
    //                 return txt
    //             }.bind(this))
    //         }
    //         db_instances[instance_key] = await createPool(db_config)
    //     }
    //     return db_instances[instance_key]
    // }

    private where(conditions) {
        const result = { sql: '', values: [] };
        if (typeof conditions === 'object' && Object.keys(conditions).length > 0) {
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
        }
        return result
    }
}




