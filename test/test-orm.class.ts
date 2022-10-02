import { GetMapping } from "../src/route-mapping.decorator";
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


}