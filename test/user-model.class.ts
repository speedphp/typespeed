import Model from "../src/database/orm-decorator";
import { log } from "../src/speed";
import UserDto from "./entities/user-dto.class";

export default class UserModel extends Model {


    public async getUsers() {
        const users = await this.find({
            id: { $lt: 10, $lte: 20 }, "name": { $like: "%a%" },
            $or: [{ id: 1 }, { id: 2 }]
        });
        log("users", users);
        return "getUsers";
    }

    public async getUser(id: number) {
        const user = await this.findOne({ id : id });
        log("user", user);
        return "getUser";
    }

    async newUsers() {
        const users = await this.create([
            new UserDto(30, "UserDto 30"),
            new UserDto(31, "UserDto 31"),
            {id : 33, name : "UserDto 33"}
        ]);
        return "newUsers";
    }
}