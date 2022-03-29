import { varchar, integer, boolean, ColumnType } from "./columns";
import { create_model, ToJS } from "./columns/models";
import { AnyTable } from "./types";
import { make_schema } from "./table"
import { entries } from "./util/entries";
import * as mysql from "mysql2/promise"

const sc = make_schema(`users`, {
  id: varchar(30, { primary_key: true }),
  name: varchar(30, { not_null: true }),
  age: integer(),
  admin: boolean()
});

const handle_constraints = ({ constraints, sql_type }: ColumnType) =>
  [
    sql_type,
    constraints.not_null && `not null`,
    constraints.unique && `unique`,
    constraints.primary_key && `primary key`
  ].filter(Boolean).join(` `)

const create_table = <Table extends AnyTable>(table: Table) =>
  `create table if not exists ${table.name} (\n${entries(table.schema)
    .map(([name, f]) => `  ${name} ${handle_constraints(f)}`)
    .join(`,\n`)}\n);`;

const m = create_model(sc);

console.log(m.name.toUpperCase().substring(2));

console.log(m.name.startsWith(`Vancho`))

const insert = <T extends AnyTable>(t: T, records: ToJS<T>[]) => {
  const header = Object.keys(records[0]) as (keyof typeof records[0])[]
  const query = `insert into ${t.name} (${header.join(`, `)}) values ${
    records.map(() => `(${header.map(() => `?`).join(`, `)})`)
  };`
  const params = records.flatMap(r => header.map(h => r[h]))

  return [query, params] as const
}

const pool = mysql.createPool({
  host: `localhost`,
  user: `kon`,
  database: `dementity`,
  password: `kiro`,
  waitForConnections: true
})

;(async () => {
  const create_table_query = create_table(sc)
  console.info(create_table_query)
  console.log(await pool.query(create_table_query))
  const [q, p] = insert(sc, [{ id: `${Math.random()}`, age: 3, admin: false, name: 'pesho' }])
  console.info(q, p)
  console.log(await pool.query(q, p))

  await pool.end()
})()
