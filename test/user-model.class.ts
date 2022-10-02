import Model from "../src/database/orm-decorator";
import { log } from "../src/speed";

export default class UserModel extends Model {


    public async getUsers() {
        const users = await this.findAll({
            id: 1, "user_id": { $lt: 10, $lte: 20 }, "user_name": { $like: "%a%" },
            $or: [{ id: 1 }, { id: 2 }]
        });
        log("users", users);
        return "getUsers";

    }
}