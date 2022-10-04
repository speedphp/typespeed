declare function insert(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare function update(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare function remove(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare function select(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare function resultType(dataClass: any): (target: any, propertyKey: string) => void;
declare function param(name: string): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
declare function cache(ttl: number): (target: any, propertyKey: string) => void;
declare class Model {
    page: any;
    private table;
    constructor(table?: string);
    findAll<T>(conditions: object | string, sort?: string | object, fields?: string | [string], limit?: number | object): Promise<T[]>;
    create(rows: any): Promise<number>;
    find<T>(conditions: any, sort: any, fields?: string): Promise<T>;
    update(conditions: any, fieldToValues: any): Promise<number>;
    delete(conditions: any): Promise<number>;
    findCount(conditions: any): Promise<number>;
    incr(conditions: any, field: any, optval?: number): Promise<number>;
    decr(conditions: any, field: any, optval?: number): Promise<number>;
    pager(page: any, total: any, pageSize?: number, scope?: number): any;
    private where;
    private range;
}
export { insert, update, remove, select, param, resultType, cache, Model };
