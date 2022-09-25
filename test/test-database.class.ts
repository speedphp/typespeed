import { Insert, Update, Select } from "../src/database/query-decorator";
import { GetMapping } from "../src/route-mapping.decorator";
import { onClass, log } from "../src/speed";

@onClass
export default class TestDatabase {

    @GetMapping("/db/insert")
    async insert(req, res) {
        const newId = await this.addRow();
        log("Insert newId: " + newId);
        res.send("Insert success");
    }

    @GetMapping("/db/update")
    async update(req, res) {
        const affectedRows = await this.editRow();
        log("Update rows: " + affectedRows);
        res.send("update success");
    }

    @GetMapping("/db/select")
    async select(req, res) {
        const rows = await this.selectRow();
        log("select rows: " + rows);
        res.send(rows);
    }

    @Insert("Insert into `user` (name) values ('test')")
    private async addRow() {}

    @Update("Update `user` set `name` = 'test5' where id = 5")
    private async editRow() {}

    @Select("Select * from `user`")
    private async selectRow() {}
}