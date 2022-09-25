import { createPool, ResultSetHeader } from 'mysql2';
import { config, log } from '../speed';
const pool = createPool(config("mysql")).promise();
const paramMetadataKey = Symbol('param');

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
            const [rows] = await pool.query(sql);
            return rows;
        };
    }
}

function Param(name: string) {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        const existingParameters: [string, number][] = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];
        existingParameters.push([name, parameterIndex]);
        Reflect.defineMetadata(paramMetadataKey, existingParameters, target, propertyKey,);
    };
}

async function queryForExecute(sql: string, args: any[], target, propertyKey: string): Promise<ResultSetHeader> {
    const queryValues = [];
    const existingParameters: [string, number][] = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey,);
    log(existingParameters);
    let argsVal;
    if (typeof args[0] === 'object') {
        argsVal = new Map(
            Object.getOwnPropertyNames(args[0]).map((valName) => [valName, args[0][valName]]),
        );
    } else {
        const existingParameters: [string, number][] = Reflect.getOwnMetadata(paramMetadataKey,target, propertyKey);
        argsVal = new Map(
            existingParameters.map(([argName, argIdx]) => [argName, args[argIdx]]),
        );
    }
    log(argsVal);
    const regExp = /#{(\w+)}/;
    let match;
    while (match = regExp.exec(sql)) {
        const [replaceTag, matchName] = match;
        sql = sql.replace(new RegExp(replaceTag, 'g'), '?');
        queryValues.push(argsVal.get(matchName));
    }
    log(queryValues);
    const [result] = await pool.query(sql, queryValues);
    return <ResultSetHeader>result;
}

export { Insert, Update, Update as Delete, Select, Param };