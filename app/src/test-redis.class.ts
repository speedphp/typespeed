import { Redis, component, redisSubscriber, autoware, getMapping, log, reqQuery } from "../../src/typespeed";

@component
export default class TestRedis {
    @autoware
    private redisObj: Redis;

    @redisSubscriber("mychannel")
    public listen(message) {
        log("Received by Decorator '%s'", message);
    }

    @getMapping("/redis/publish")
    async redisPublish() {
        await this.redisObj.publish("mychannel", "Hello World");
        return "Published!";
    }

    @getMapping("/redis")
    async redisString() {
        await this.redisObj.set("redisKey", "Hello World");
        const value = await this.redisObj.get("redisKey");
        return "get from redis: " + value;
    }

    @getMapping("/redis/add")
    async addZset(@reqQuery name: string, @reqQuery score: number) {
        log("add zset: %s, %s", name, score)
        await this.redisObj.zadd("scoreSet", score, name);
        return "add zset success";
    }

    @getMapping("/redis/ranking")
    async listRanking() {
        const list = await this.redisObj.zrevranking("scoreSet", 0, -1);
        return Object.fromEntries(list);
    }

    @getMapping("/redis/list")
    async listZset() {
        const list = await this.redisObj.zranking("scoreSet", 0, -1);
        log("list zset: %s", JSON.stringify(Object.fromEntries(list)));
        return Object.fromEntries(list);
    }
}