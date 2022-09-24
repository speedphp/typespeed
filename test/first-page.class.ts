import { log, onClass } from "../src/speed";
import { GetMapping } from "../src/route-mapping.decorator";

@onClass
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
            "from" : "sendJson",
            "to" : "Browser"
        }
    }

    @GetMapping("/first/sendResult")
    public sendResult() {
        log("FirstPage sendResult running");
        return "sendResult";
    }

    public getTestFromFirstPage() {
        return "getTestFromFirstPage";
    }
}