import { log } from "../src/speed";
import { GetMapping } from "../src/route-mapping.decorator";



export default class FirstPage {

    @GetMapping("/first")
    public index(req: any, res: any) {
        log("FirstPage index running");
        res.send("FirstPage index running");
    }

}