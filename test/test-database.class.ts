import { Insert } from "../src/database/query-decorator";
import { GetMapping } from "../src/route-mapping.decorator";
import { onClass } from "../src/speed";

@onClass
export default class TestDatabase {

    @GetMapping("/db/insert")
    async insert(req, res) {
        this.addRow();
        res.send("Insert success");
    }

    @Insert("Insert into `user` (name) values ('test')")
    private async addRow() {}
}