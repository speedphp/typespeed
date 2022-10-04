export default abstract class CacheFactory {
    abstract get(key: string): any;
    abstract set(key: string, value: any, expire?: number): void;
    abstract del(key: string): void;
    abstract has(key: string): boolean;
    abstract flush(): void;
}
