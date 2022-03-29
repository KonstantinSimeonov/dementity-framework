import { varchar, integer, boolean } from "./columns";
import { create_model } from "./columns/models";
import { AnyTable } from "./types";
import { make_schema } from "./table"
import { entries } from "./util/entries";

const sc = make_schema(`users`, {
  id: varchar(30),
  name: varchar(30),
  age: integer(),
  admin: boolean()
});

const create_table = <Table extends AnyTable>(table: Table) =>
  `create table ${table.name} (\n${entries(table.schema)
    .map(([name, f]) => `  ${name} ${f.sql_type}`)
    .join(`,\n`)}\n);`;

const m = create_model(sc);

console.log(m.name.toUpperCase().substring(2));

console.log(m.name.startsWith(`Vancho`))

console.log(create_table(sc));
