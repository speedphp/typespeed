

const sql = "select * From `user` where id = ?";

console.log(sql.match(/\s+from\s+([\w`\'\"]+)/i));

const insert = "Insert into `user` (id, name) values (#{id}, #{name})";

console.log(insert.match(/insert\sinto\s+([\w`\'\"]+)/i));

const update = "Update `user` set name = #{name} where id = #{id}";

console.log(update.match(/update\s+([\w`\'\"]+)/i));

const delete1 = "Delete from `user` where id = #{id}";

console.log(delete1.match(/delete\sfrom\s+([\w`\'\"]+)/i));