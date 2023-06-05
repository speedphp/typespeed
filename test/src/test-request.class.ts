import { component, getMapping } from "../../";
import { req, res } from "../../src/route.decorator";


@component
export default class TestRequest {

    @getMapping("/request/res")
    testRes(@req req, @res res) {
        res.send("test res");
    }


}