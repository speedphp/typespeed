import { GetMapping } from "../src/route-mapping.decorator";
import { autoware, component, log } from "../src/speed";
import UserModel from "./user-model.class";

@component
export default class TestOrm {

    @autoware
    private userModel: UserModel;

    @GetMapping("/orm/first")
    async firstTest(req, res) {
        log(this.userModel);
        const results = await this.userModel.findAll("1=1");
        res.send("first test");
    }




}