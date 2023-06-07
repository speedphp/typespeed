import { component, getMapping, postMapping, log } from "../../";
import { req, res, reqQuery, reqBody, reqForm, reqParam } from "../../src/route.decorator";
import MutilUsers from "./entities/mutil-users.class";
import UserDto from "./entities/user-dto.class";


@component
export default class TestRequest {

    @getMapping("/request/res")
    testRes(@req req, @res res) {
        res.send("test res");
    }

    @getMapping("/request/query")
    testQuery(req, res, @reqQuery("id") id: number): Promise<MutilUsers> {
        log("id: " + id);
        return Promise.resolve(new MutilUsers("group", [new UserDto(1, "name"), new UserDto(2, "name")]));
    }

    @postMapping("/request/body")
    testBody(@res res, @reqBody body: object):MutilUsers {
        log("body: " + JSON.stringify(body));
        return new MutilUsers("group", [new UserDto(1, "name"), new UserDto(2, "name")]);
    }

    @postMapping("/request/form")
    testForm(@res res, @reqForm("name") name: string) {
        log("form: " + JSON.stringify(name));
        res.send("test form");
    }

    @getMapping("/request/param/:id")
    testParam(@res res, @reqParam("id") id: number) {
        log("id: " + id);
        res.send("test param");
    }
}