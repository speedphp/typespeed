export default abstract class CacheFactory {
    public abstract get(key: string): any;
    public abstract set(key: string, value: any, expire?: number): void;
    public abstract del(key: string): void;
    public abstract has(key: string): boolean;
    public abstract flush(): void;
}