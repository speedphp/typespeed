import * as jwttoken from "jsonwebtoken";
import { log, component } from "../src/speed";
import { GetMapping } from "../src/route-mapping.decorator";

@component
export default class FirstPage {

    @GetMapping("/first")
    public index(req: any, res: any) {
        log("FirstPage index running" + this.getTestFromFirstPage());
        res.send("FirstPage index running");
    }

    @GetMapping("/first/sendJson")
    public sendJson() {
        log("FirstPage sendJson running");
        return {
            "from": "sendJson",
            "to": "Browser"
        }
    }

    @GetMapping("/first/sendResult")
    public sendResult() {
        log("FirstPage sendResult running");
        return "sendResult";
    }

    @GetMapping("/first/renderTest")
    public renderTest(req: any, res: any) {
        res.render("index", { name: "zzz" });
    }

    @GetMapping("/login")
    login() {
        const token = jwttoken.sign({ foo: 'bar' }, 'shhhhhhared-secret');
        /**
         * 将这里获得的token，放到header的Authorization中。
         * 值是：Bearer + token
         */
        return token;
    }

    public getTestFromFirstPage() {
        return "getTestFromFirstPage";
    }
}