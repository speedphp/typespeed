import * as lodash from 'lodash';
import { Connection, createPool, ResultSetHeader } from 'mysql2';
import { actionQuery, actionExecute } from '../database/curd-decorator';
import { config, log } from "../speed";
const db_instances = {}

export default class Model {

    private _page;
    private tableName: string;

    constructor(_tableName: string) {
        if (_tableName !== undefined) this.tableName = _tableName
        this._page = null
    }

    get page() {
        return this._page
    }

    set table(_tableName) {
        this.tableName = _tableName
    }

    async findAll(conditions: string | object, _sort?, fields?, _limit?) {
        let sort = _sort ? ' ORDER BY ' + _sort : ''
        let [where, params] = this._where(conditions)
        let sql = ' FROM ' + this.tableName + where
        let limit: string | number = _limit;
        if (_limit === undefined || typeof _limit === 'string') {
            sql += (_limit === undefined) ? '' : ' LIMIT ' + _limit
        } else {
            let total = await this.query('SELECT COUNT(*) AS M_COUNTER ' + sql, params)
            if (!total[0]['M_COUNTER'] || total[0]['M_COUNTER'] == 0) return false
            limit = lodash.merge([1, 10, 10], _limit)
            limit = this.pager(limit[0], limit[1], limit[2], total[0]['M_COUNTER'])
            limit = lodash.isEmpty(limit) ? '' : ' LIMIT ' + limit['offset'] + ',' + limit['limit']
        }
        return await actionQuery('SELECT ' + fields + sql + sort + limit, params)
    }

    async create(row) {
        let sql = 'INSERT INTO ' + this.tableName
            + ' (' + Object.keys(row).map((k) => '`' + k + '`').join(', ')
            + ') VALUES (' + Object.keys(row).map((k) => ':' + k).join(', ')
            + ')'
        let res = await this.execute(sql, row)
        return res
    }

    async find(conditions, _sort, fields = '*') {
        let res = await this.findAll(conditions, _sort, fields, 1)
        return !lodash.isEmpty(res) ? res[0] : false
    }

    async update(conditions, row) {
        let [where, params] = this._where(conditions)
        let values = {}
        let sql = 'UPDATE ' + this.tableName
            + ' SET ' + lodash.map(row, (v, k) => {
                values[k] = v
                return '`' + k + '` = :' + k
            }).join(', ')
            + where
        let res = await this.execute(sql, lodash.merge(params, values))
        return res
    }

    async delete(conditions) {
        let [where, params] = this._where(conditions)
        let res = await this.execute('DELETE FROM ' + this.tableName + where, params)
        return res
    }

    async findCount(conditions) {
        let [where, params] = this._where(conditions)
        let res = await this.query('SELECT COUNT(*) AS M_COUNTER FROM ' + this.tableName + where, params)
        return res[0]['M_COUNTER'] || 0
    }

    async incr(conditions, field, optval = 1) {
        let [where, params] = this._where(conditions)
        let sql = 'UPDATE ' + this.tableName + ' SET `' + field + '` = `'
            + field + '` + :M_INCR_VAL' + where
        let res = await this.execute(sql, lodash.merge(params, { 'M_INCR_VAL': optval }))
        return res
    }

    decr(conditions, field, optval = 1) {
        return this.incr(conditions, field, -optval)
    }

    pager(page, pageSize = 10, scope = 10, total) {
        this._page = null
        if (total === undefined) throw new Error('Pager total would not be undefined')
        if (total > pageSize) {
            let totalPage = Math.ceil(total / pageSize)
            page = Math.min(Math.max(page, 1), total)
            this._page = {
                'total_count': total,
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
                this._page.allPages = lodash.range(1, totalPage)
            } else if (page <= scope / 2) {
                this._page.allPages = lodash.range(1, scope)
            } else if (page <= totalPage - scope / 2) {
                let right = page + (scope / 2)
                this._page.allPages = lodash.range(right - scope + 1, right)
            } else {
                this._page.allPages = lodash.range(totalPage - scope + 1, totalPage)
            }
        }
        return this._page
    }

    _where(conditions) {
        let result = [" ", {}]
        if (typeof conditions === 'object' && !lodash.isEmpty(conditions)) {
            let sql = null
            if (conditions['where'] !== undefined) {
                sql = conditions['where']
                conditions['where'] = undefined
            }
            if (!sql) sql = Object.keys(conditions).map((k) => '`' + k + '` = :' + k).join(" AND ")
            result[0] = " WHERE " + sql
            result[1] = conditions
        }
        return result
    }

    query(_sql, _values) {
        return this.execute(_sql, _values, true)
    }

    async execute(_sql, _values, readonly = false) {
        let connection: Connection;
        const mysqlConfig = config("mysql");
        if (readonly === true && mysqlConfig.slave !== undefined) {
            let instanceKey = Math.floor(Math.random() * (mysqlConfig.slave.length))
            connection = await this._db_instance(mysqlConfig.slave[instanceKey], 'slave_' + instanceKey)
        } else {
            connection = await this._db_instance(mysqlConfig, 'master')
        }
        let sql = connection.format(_sql, _values)
        return await connection.query(sql);
    }

    async _db_instance(db_config, instance_key) {
        if (db_instances[instance_key] === undefined) {
            db_config.queryFormat = function (query, values) {
                if (!values) return query
                return query.replace(/\:(\w+)/g, function (txt, key) {
                    if (values.hasOwnProperty(key)) {
                        return this.escape(values[key])
                    }
                    return txt
                }.bind(this))
            }
            db_instances[instance_key] = await createPool(db_config)
        }
        return db_instances[instance_key]
    }

}

