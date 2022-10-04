import { log, component, getMapping } from "typespeed";

@component
export default class FrontPage {

    @getMapping("/")
    public index(req, res) {
        log("Front page running.");
        res.send("Front page running.");
    }

}