import { GetMapping } from "../src/route-mapping.decorator";
import { autoware, onClass, log } from "../src/speed";
import UserModel from "./user-model.class";

@onClass
export default class TestOrm {

    @autoware
    private userModel: UserModel;

    @GetMapping("/orm/first")
    firstTest(req, res) {
        log(this.userModel);
        this.userModel.findAll({}, {}, "*", 10);
        res.send("first test");
    }




}