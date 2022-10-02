import CacheFactory from "../src/factory/cache-factory.class";
import { Insert, Update, Select, Param, ResultType, cache } from "../src/database/query-decorator";
import { GetMapping } from "../src/route-mapping.decorator";
import { onClass, log, autoware } from "../src/speed";
import UserDto from "./entities/user-dto.class";

@onClass
export default class TestDatabase {

    @autoware
    private cacheBean: CacheFactory;

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

    @GetMapping("/db/select1")
    async selectById(req, res) {
        const row = await this.findRow(req.query.id || 1);
        log("select rows: " + row);
        res.send(row);
    }

    @GetMapping("/db/select-user")
    async selectUser(req, res) {
        const users: UserDto[] = await this.findUsers();
        log("select users: " + users);
        res.send(users);
    }

    @GetMapping("/db/set-cache")
    testCache(req, res) {
        this.cacheBean.set("test", req.query.value || "test");
        res.send("set cache success");
    }

    @GetMapping("/db/get-cache")
    displayCache(req, res) {
        res.send(this.cacheBean.get("test"));
    }

    @Insert("Insert into `user` (id, name) values (#{id}, #{name})")
    private async addRow(@Param("name") newName: string, @Param("id") id: number) { }

    @Insert("Insert into `user` (id, name) values (#{id}, #{name})")
    private async addRowByObject(myParams: object) { }

    @Update("Update `user` set `name` = 'test5' where id = 5")
    private async editRow() { }

    @Select("Select * from `user`")
    private async selectRow() { }

    @cache(1800)
    @Select("Select * from `user` where id = #{id}")
    private async findRow(@Param("id") id: number) { }

    @ResultType(UserDto)
    @Select("Select * from `user`")
    private findUsers(): UserDto[] { return; }
}