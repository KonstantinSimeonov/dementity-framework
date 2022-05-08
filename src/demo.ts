import { varchar, integer, boolean } from "./columns";
import { create_table, make_schema } from "./table";
import * as mysql from "mysql2/promise";
import { insert } from "./query/insert";
import { select, select1 } from "./query/select";

const Users = make_schema(`users`, {
  id: varchar(30, { primary_key: true }),
  name: varchar(30, { not_null: true }),
  age: integer(),
  admin: boolean(),
});

const Pets = make_schema(`pets` as const, {
  id: varchar(30, { primary_key: true }),
  name: varchar(30, { not_null: true }),
  type: varchar(30, {}),
  owner_id: varchar(30),
  fav_treat_id: varchar(30)
} as const)

const Treats = make_schema(`treats`, {
  id: varchar(30, { primary_key: true }),
  name: varchar(30),
  calories: integer()
})

//const m = sc.model;

//console.log(m.name.toUpperCase().substring(2));
//
//console.log(m.name.startsWith(`Vancho`));

const pool = mysql.createPool({
  host: `localhost`,
  user: `kon`,
  database: `dementity`,
  password: `kiro`,
  waitForConnections: true,
});

;(async () => {
  //const create_table_query = create_table(sc);
  //console.info(create_table_query);
  //console.log(await pool.query(create_table_query));
  //const [q, p] = insert(sc, [
  //  { id: `${Math.random()}`, age: 3, admin: false, name: "pesho" },
  //  { id: `${Math.random()}`, age: 30, admin: true, name: "denis" },
  //]);
  //console.info(q, p);
  //console.log(await pool.query(q, p));
  const s = Users
    .join(Pets, j => {
       return j.pets.owner_id.eq(j.users.id)
    })
    .join(Treats, j => j.treats.id.eq(j.pets.fav_treat_id))

  const y = s.select((users, { pets, treats }) => ({
    same_name: pets.name.eq(users.name),
    t: treats.name
  }))
    .where(q => q.users.name.startsWith("Ivan"))
    .limit(5)

  console.log(y.to_sql())

  //await pool.end();
})();
