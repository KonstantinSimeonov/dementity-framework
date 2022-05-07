import { varchar, integer, boolean } from "./columns";
import { create_table, make_schema } from "./table";
import * as mysql from "mysql2/promise";
import { insert } from "./query/insert";
import { select, select1 } from "./query/select";

const users = make_schema(`users`, {
  id: varchar(30, { primary_key: true }),
  name: varchar(30, { not_null: true }),
  age: integer(),
  admin: boolean(),
});

const pets = make_schema(`pets` as const, {
  id: varchar(30, { primary_key: true }),
  name: varchar(30, { not_null: true }),
  type: varchar(30, {}),
  owner_id: varchar(30),
  fav_treat_id: varchar(30)
} as const)

const treats = make_schema(`treats`, {
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

type Test<T extends Record<string, number>> = {
  join<A extends { a: string; b: number }>(x: A): Test<T & Record<A['a'], A['b']>>
  x: T
}

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
  const s = users
    .join(pets, j => {
       return j.pets.owner_id.eq(j.users.id)
    })
    .join(treats, j => j.treats.id.eq(j.pets.fav_treat_id))

  s.select((users, { pets, treats }) => ({
    same_name: pets.name.eq(users.name),
    t: treats.name
  }))

  console.log(s.to_sql())

  //await pool.end();
})();
