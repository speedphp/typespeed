import { Insert, Update, Select, Param } from "../src/database/query-decorator";
import { GetMapping } from "../src/route-mapping.decorator";
import { onClass, log } from "../src/speed";

@onClass
export default class TestDatabase {

    @GetMapping("/db/insert")
    async insert(req, res) {
        const newId = await this.addRow("new name 21", 24);
        log("Insert newId: " + newId);
        res.send("Insert success");
    }

    @GetMapping("/db/insert2")
    async insertByObject(req, res) {
        const newId = await this.addRowByObject({
            "id": 23, "name": "new name 22"
        });
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

    @Insert("Insert into `user` (id, name) values (#{id}, #{name})")
    private async addRow(@Param("name") newName: string, @Param("id") id: number) { }

    @Insert("Insert into `user` (id, name) values (#{id}, #{name})")
    private async addRowByObject(myParams: object) { }

    @Update("Update `user` set `name` = 'test5' where id = 5")
    private async editRow() { }

    @Select("Select * from `user`")
    private async selectRow() { }
}