import { resource, component, log, autoware, schedule, getMapping, postMapping, Redis } from "../../src/speed";
import UserModel from "./user-model.class";

@component
export default class TestOrm {

    @resource("user")
    private userModel: UserModel;

    @autoware
    private redisObj: Redis;

    @getMapping("/redis")
    async redisTest() {
        await this.redisObj.set("redisKey", "Hello World");
        const value = await this.redisObj.get("redisKey");
        log(value)
        return "get from redis: " + value;
    }

    @getMapping("/orm/first")
    async firstTest(req, res) {
        const results = await this.userModel.getUsers();
        res.send("first test, to " + results);
    }

    @getMapping("/orm/one")
    async findOneTest(req, res) {
        const results = await this.userModel.getUser(req.query.id || 0);
        res.send("find one test, to " + results);
    }

    @getMapping("/orm/delete")
    async deleteTest(req, res) {
        const results = await this.userModel.remove(req.query.id || 0);
        res.send("remove user, results: " + results);
    }

    @getMapping("/orm/count")
    async countTest(req, res) {
        const results = await this.userModel.count();
        res.send(results);
    }

    @getMapping("/orm/new")
    async newUserTest(req, res) {
        const results = await this.userModel.newUsers();
        res.send("new user test, to " + results);
    }

    @getMapping("/orm/page/calculate")
    async calculatePage(req, res) {
        const pages = this.userModel.pager(15, 376);
        res.send("pages calculate result: " + JSON.stringify(pages));
    }

    @getMapping("/orm/pages/:id")
    async findPage(req, res) {
        const results = await this.userModel.findAll("1", { id: -1 }, "*", { page: req.params.id, pageSize: 3 });
        log(this.userModel.page);
        res.send("pages find result: " + JSON.stringify(results));
    }

    @postMapping("/orm/edit")
    async updateTest(req, res) {
        const results = await this.userModel.editUser(req.body.id, req.body.name);
        res.send(results);
    }

    //@schedule("* * * * * *")
    myTimer() {
        log("myTimer running");
    }
}