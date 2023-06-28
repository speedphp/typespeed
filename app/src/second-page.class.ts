import { getMapping, postMapping, upload, jwt, log, component } from "../../src/typespeed";

@component
export default class SecondPage {

    @getMapping("/second/setCookie")
    setCookiePage(req, res) {
        res.cookie("name", "zzz");
        return "setCookie";
    }

    @getMapping("/second/getCookie")
    getCookiePage(req, res) {
        const cookieName = req.cookies.name;
        return "getCookie: " + cookieName;
    }

    @getMapping("/second/testSession")
    testForSession(req, res) {
        req.session.view = req.session.view ? req.session.view + 1 : 1;
        return "testForSession: " + req.session.view;
    }

    @postMapping("/upload")
    @upload
    public upload(req, res) {
        const files = req.files;
        log(files);
        log("uploaded");
        res.send("upload success");
    }

    @jwt({ secret: "shhhhhhared-secret", algorithms: ["HS256"] })
    @postMapping("/form")
    form(req, res) {
        res.render("upload");
    }

    @getMapping("/second/testError")
    testError(req, res) {
        throw new Error('Test Error');
    }
}