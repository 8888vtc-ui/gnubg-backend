/**
 * Cache Redis - Optimisation des performances
 */
declare class RedisCache {
    private static client;
    private static isConnected;
    static connect(): Promise<void>;
    static get(key: string): Promise<string | null>;
    static set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    static del(key: string): Promise<void>;
    static keys(pattern: string): Promise<string[]>;
    private static ensureConnection;
    static disconnect(): Promise<void>;
}
export default RedisCache;
//# sourceMappingURL=redis.d.ts.map