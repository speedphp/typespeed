import { Connection, createPool, ResultSetHeader } from 'mysql2';
import { config, log } from "../speed";
const db_instances = {}
const execute_sql = []

class Model {

    public tableName: string;

    constructor(_tableName: string) {
        if (_tableName !== undefined) this.tableName = _tableName;
    }

    async findAll(conditions, _sort, fields = '*', _limit) {
        log('findAll', conditions, _sort, fields, _limit);
    }
}

export default function model(tableName: string) {
    return <T extends { new(...args: any[]): {} }>(constructorFunction: T) => {
        const newConstructorFunction: any = function (...args) {
            const func: any = function () {
                return new constructorFunction(...args);
            };
            func.prototype = Model.prototype;
            return new func();
        };
        newConstructorFunction.prototype = constructorFunction.prototype;
        return newConstructorFunction;
    }
}
