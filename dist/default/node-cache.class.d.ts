import CacheFactory from "../factory/cache-factory.class";
export default class NodeCache extends CacheFactory {
    private NodeCache;
    private nodeCacheOptions;
    private config;
    constructor();
    getNodeCache(): CacheFactory;
    get(key: string): any;
    set(key: string, value: any, expire?: number): void;
    del(key: string): void;
    has(key: string): boolean;
    flush(): void;
}
