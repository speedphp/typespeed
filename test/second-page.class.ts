import * as multiparty from "multiparty";
import * as util from "util"
import { log, onClass } from "../src/speed";
import { GetMapping, PostMapping } from "../src/route-mapping.decorator";

@onClass
export default class SecondPage {

    @GetMapping("/second/setCookie")
    setCookiePage(req, res) {
        res.cookie("name", "zzz");
        return "setCookie";
    }

    @GetMapping("/second/getCookie")
    getCookiePage(req, res) {
        const cookieName = req.cookies.name;
        return "getCookie: " + cookieName;
    }

    @GetMapping("/second/testSession")
    testForSession(req, res) {
        req.session.view = req.session.view ? req.session.view + 1 : 1;
        return "testForSession: " + req.session.view;
    }

    @PostMapping("/upload")
    public upload(req, res) {
        const form = new multiparty.Form();

        form.parse(req, (err, fields, files) => {
            res.writeHead(200, { 'content-type': 'text/plain' });
            res.write('received upload:\n\n');
            log(files);
            res.end(util.inspect({ fields: fields, files: files }));
        });
    }

    @GetMapping("/form")
    form(req, res) {
        res.render("upload");
    }
}