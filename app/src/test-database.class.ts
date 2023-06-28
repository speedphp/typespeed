import { insert, update, select, param, resultType, cache, CacheFactory, getMapping, component, log, autoware } from "../../src/typespeed";
import UserDto from "./entities/user-dto.class";

@component
export default class TestDatabase {

    @autoware
    private cacheBean: CacheFactory;

    @getMapping("/db/insert")
    async insert(req, res) {
        const id = req.query.id || 1;
        const newId = await this.addRow("new name " + id, id);
        res.send("Insert success: " + newId);
    }

    @getMapping("/db/insert2")
    async insertByObject(req, res) {
        const newId = await this.addRowByObject({
            "id": req.query.id, "name": "new name " + req.query.id
        });
        res.send("Insert success: " + newId);
    }

    @getMapping("/db/update")
    async update(req, res) {
        const affectedRows = await this.editRow(req.query.id);
        log("Update rows: " + affectedRows);
        res.send("update success: " + affectedRows);
    }

    @getMapping("/db/select")
    async select(req, res) {
        const rows = await this.selectRow();
        log("select rows: " + rows);
        res.send(rows);
    }

    @getMapping("/db/select-row")
    async selectById(req, res) {
        const row = await this.findRow(req.query.id);
        res.send(row);
    }

    @getMapping("/db/select-user")
    async selectUser(req, res) {
        const users: UserDto[] = await this.findUsers();
        res.send(users);
    }

    @getMapping("/db/set-cache")
    testCache(req, res) {
        this.cacheBean.set("test", req.query.value || "test");
        res.send("set cache success");
    }

    @getMapping("/db/get-cache")
    displayCache(req, res) {
        res.send(this.cacheBean.get("test"));
    }

    @insert("Insert into `user` (id, name) values (#{id}, #{name})")
    private async addRow(@param("name") newName: string, @param("id") id: number) { }

    @insert("Insert into `user` (id, name) values (#{id}, #{name})")
    private async addRowByObject(myParams: object) { }

    @update("Update `user` set `name` = 'test5' where id = #{id}")
    private async editRow(@param("id") id: number) { }

    @select("Select * from `user`")
    private async selectRow() { }

    @cache(1800)
    @select("Select * from `user` where id = #{id}")
    private async findRow(@param("id") id: number) { }

    @resultType(UserDto)
    @select("Select * from `user`")
    private findUsers(): UserDto[] { return; }
}