import { component, getMapping, bind, resource, autoware, bean, insert } from "../../src/typespeed";
import UserModel from "./user-model.class";

class TestBean {
    name = "test-bean";
}

@component
export default class TestBind {

    @bean(TestBean)
    getBeanInstance() { return new TestBean(); }

    @autoware(TestBean)
    private autowired: TestBean;

    @resource(UserModel, "user")
    private userModel: UserModel;

    @getMapping("/bind/param/:id")
    @bind({ id: "reqParam", name: "reqQuery" })
    async bindParam(id: string, name: string) {
        return { id, name };
    }

    @getMapping("/bind/token")
    async bindToken(req, res) {
        res.send(this.autowired.name + "|" + (this.userModel ? "model-ok" : "model-null"));
    }

    @getMapping("/bind/db")
    async bindDb(req, res) {
        const id = req.query.id || 1;
        const newId = await this.addRowByBind("bind name " + id, id);
        res.send("bind insert: " + newId);
    }

    @insert("Insert into `user` (id, name) values (#{id}, #{name})")
    @bind({ name: 0, id: 1 })
    private async addRowByBind(newName: string, id: number) { }
}
