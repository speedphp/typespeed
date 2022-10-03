import { GetMapping, PostMapping, upload } from "../src/route-mapping.decorator";
import { autoware, component, log } from "../src/speed";
import UserModel from "./user-model.class";

@component
export default class TestOrm {

    @autoware("user")
    private userModel: UserModel;

    @GetMapping("/orm/first")
    async firstTest(req, res) {
        log(this.userModel);
        const results = await this.userModel.getUsers();
        res.send("first test, to " + results);
    }

    @GetMapping("/orm/one")
    async findOneTest(req, res) {
        log(this.userModel);
        const results = await this.userModel.getUser(req.query.id || 0);
        res.send("find one test, to " + results);
    }

    @GetMapping("/orm/delete")
    async deleteTest(req, res) {
        log(this.userModel);
        const results = await this.userModel.remove(req.query.id || 0);
        res.send("remove user, results: " + results);
    }

    @GetMapping("/orm/count")
    async countTest(req, res) {
        log(this.userModel);
        const results = await this.userModel.count();
        res.send(results);
    }

    @GetMapping("/orm/new")
    async newUserTest(req, res) {
        log(this.userModel);
        const results = await this.userModel.newUsers();
        res.send("new user test, to " + results);
    }
 
    @PostMapping("/orm/edit")
    async updateTest(req, res) {
        log(req.body);
        const results = await this.userModel.editUser(req.body.id, req.body.name);
        res.send(results);
    }
}