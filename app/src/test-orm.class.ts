import { resource, component, log, autoware, schedule, getMapping, postMapping, Redis } from "../../src/typespeed";
import UserModel from "./user-model.class";

@component
export default class TestOrm {

    @resource("user")
    private userModel: UserModel;

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
        const total = await this.userModel.count();
        res.send({"count": total});
    }

    @getMapping("/orm/new")
    async newUserTest(req, res) {
        const newId = await this.userModel.newUsers();
        res.send({"newId": newId});
    }

    @getMapping("/orm/page/calculate")
    async calculatePage(req, res) {
        const pages = this.userModel.pager(15, 376);
        res.json(pages);
    }

    @getMapping("/orm/pages/:id")
    async findPage(req, res) {
        const results = await this.userModel.findAll("1", { id: -1 }, "*", { page: req.params.id, pageSize: 3 });
        log(this.userModel.page);
        res.json(results);
    }

    @postMapping("/orm/edit")
    async updateTest(req, res) {
        const effectRows = await this.userModel.editUser(req.body.id, req.body.name);
        res.send({"effectRows": effectRows});
    }

    //@schedule("* * * * * *")
    myTimer() {
        log("myTimer running");
    }
}