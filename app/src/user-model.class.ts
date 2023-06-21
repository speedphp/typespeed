import { log, Model } from "../../";
import UserDto from "./entities/user-dto.class";

export default class UserModel extends Model {


    async getUsers() {
        const users = await this.findAll({
            id: { $lt: 10, $lte: 20 }, "name": { $like: "%a%" },
            $or: [{ id: 1 }, { id: 2 }]
        }, "id asc", "*", { page: 1, pageSize: 10 });
        log("users", users);
        return "getUsers";
    }

    async getUser(id: number) {
        const user = await this.find({ id: id }, "id asc", "*");
        log("user", user);
        return "getUser";
    }

    async newUsers() {
        const newId = Math.ceil(Math.random() * 1000);
        await this.create([
            new UserDto(newId, "UserDto " + newId),
            new UserDto(newId+1, "UserDto " + (newId+1)),
            { id: newId+2, name: "UserDto " + (newId+2) },
        ]);
        return newId;
    }

    async remove(id: number) {
        const result = await this.delete({ id: id });
        return "remove rows: " + result;
    }

    async count():Promise<number> {
        const result = await this.findCount("1");
        return result;
    }

    async editUser(id: number, name: string) {
        const effectRows = await this.update({ id: id }, { name: name });
        return effectRows;
    }
}