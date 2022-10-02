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
        const results = await this.userModel.findAll({id:1, "user_id":{$lt:10}});
        log(results);
        res.send("first test");
    }




}