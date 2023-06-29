import { Redis, component, redisSubscriber, autoware, getMapping, log } from "../../src/typespeed";

@component
export default class TestRedis {


    @autoware
    private redisObj: Redis;

    @redisSubscriber("mychannel")
    public listen(message) {
        log("Received by Decorator '%s'", message);
    }

    @getMapping("/redis/publish")
    async redisTest() {
        await this.redisObj.publish("mychannel", "Hello World");
        return "Published!";
    }

}