import { createPool, ResultSetHeader } from 'mysql2';
import { config, log } from '../speed';
import BeanFactory from "../bean-factory.class";
import CacheFactory from '../factory/cache-factory.class';
const pool = createPool(config("mysql")).promise();
const paramMetadataKey = Symbol('param');
const resultTypeMap = new Map<string, object>();
const cacheDefindMap = new Map<string, number>();
let cacheBean: CacheFactory;

function Insert(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql, args, target, propertyKey);
            return result.insertId;
        };
    };
}

function Update(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql, args, target, propertyKey);
            return result.affectedRows;
        };
    };
}

function Select(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            let newSql = sql;
            let sqlValues = [];
            if (args.length > 0) {
                [newSql, sqlValues] = convertSQLParams(args, target, propertyKey, newSql);
            }
            let rows;
            if (cacheBean && cacheDefindMap.has([target.constructor.name, propertyKey].toString())) {
                const cacheKey = JSON.stringify([newSql, sqlValues]);
                if (cacheBean.get(cacheKey)) {
                    rows = cacheBean.get(cacheKey);
                } else {
                    [rows] = await pool.query(newSql, sqlValues);
                    log("cache miss, and select result for " + rows);
                    const ttl = cacheDefindMap.get([target.constructor.name, propertyKey].toString());
                    cacheBean.set(cacheKey, rows, ttl);
                }
            } else {
                [rows] = await pool.query(newSql, sqlValues);
            }

            if (rows === null || Object.keys(rows).length === 0) {
                return;
            }
            const records = [];
            const resultType = resultTypeMap.get([target.constructor.name, propertyKey].toString());
            if(!resultType){
                return rows;
            }
            for (const rowIndex in rows) {
                const entity = Object.create(resultType);
                Object.getOwnPropertyNames(resultType).forEach(function (propertyRow) {
                    if (rows[rowIndex].hasOwnProperty(propertyRow)) {
                        Object.defineProperty(
                            entity,
                            propertyRow,
                            Object.getOwnPropertyDescriptor(rows[rowIndex], propertyRow),
                        );
                    }
                });
                records.push(entity);
            }
            return records;
        };
    }
}

function ResultType(dataClass) {
    return function (target, propertyKey: string) {
        resultTypeMap.set([target.constructor.name, propertyKey].toString(), new dataClass());
        //never return
    };
}

function Param(name: string) {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        const existingParameters: [string, number][] = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];
        existingParameters.push([name, parameterIndex]);
        Reflect.defineMetadata(paramMetadataKey, existingParameters, target, propertyKey);
    };
}

async function queryForExecute(sql: string, args: any[], target, propertyKey: string,): Promise<ResultSetHeader> {
    let sqlValues = [];
    let newSql = sql;
    if (args.length > 0) {
        [newSql, sqlValues] = convertSQLParams(args, target, propertyKey, newSql);
    }
    const [result] = await pool.query(newSql, sqlValues);
    return <ResultSetHeader>result;
}

function convertSQLParams(args: any[], target: any, propertyKey: string, decoratorSQL: string,): [string, any[]] {
    const queryValues = [];
    let argsVal;
    if (typeof args[0] === 'object') {
        argsVal = new Map(
            Object.getOwnPropertyNames(args[0]).map((valName) => [valName, args[0][valName]]),
        );
    } else {
        const existingParameters: [string, number][] = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey);
        argsVal = new Map(
            existingParameters.map(([argName, argIdx]) => [argName, args[argIdx]]),
        );
    }
    const regExp = /#{(\w+)}/;
    let match;
    while (match = regExp.exec(decoratorSQL)) {
        const [replaceTag, matchName] = match;
        decoratorSQL = decoratorSQL.replace(new RegExp(replaceTag, 'g'), '?');
        queryValues.push(argsVal.get(matchName));
    }
    return [decoratorSQL, queryValues];
}

function cache(ttl: number) {
    return function (target: any, propertyKey: string) {
        cacheDefindMap.set([target.constructor.name, propertyKey].toString(), ttl);
        if (cacheBean == null) {
            const cacheFactory = BeanFactory.getBean(CacheFactory);
            if (cacheFactory || cacheFactory["factory"]) {
                cacheBean = cacheFactory["factory"];
            }
        }
        log(cacheDefindMap);
    }
}

export { Insert, Update, Update as Delete, Select, Param, ResultType, cache };