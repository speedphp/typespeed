import { before, log, onClass } from "../src/speed";
import FirstPage from "./first-page.class";

@onClass
export default class AopTest {

    @before(FirstPage, "index")
    public FirstIndex() {
        log("Before FirstPage index run, at AopTest FirstIndex.");
        return "FirstIndex";
    }

}