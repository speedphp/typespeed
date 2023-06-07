import UserDto from "./user-dto.class";

export default class MutilUsers {
    constructor(public group: string, public users: UserDto[]){}
}