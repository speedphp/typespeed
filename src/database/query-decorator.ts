import { createPool, ResultSetHeader } from 'mysql2';
import { config } from '../speed';
const pool = createPool(config("mysql")).promise();

function Insert(sql: string) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql);
            return result.insertId;
        };
    };
}

function Update(sql: string) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql);
            return result.affectedRows;
        };
    };
  }

async function queryForExecute(sql: string): Promise<ResultSetHeader> {
  const [result] = await pool.query(sql);
  return <ResultSetHeader>result;
}

export { Insert, Update, Update as Delete };