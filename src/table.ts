import { varchar, integer, boolean, ColumnType } from "./columns";
import { AnyTable } from "./types";
import { entries } from "./util/entries";
import { create_model } from "./columns/models";

const make_schema = <
  Name extends string,
  Schema extends Record<string, ColumnType>
>(
  name: Name,
  schema: Schema
) => ({
  name,
  schema: Object.fromEntries(
    entries(schema).map(([name, value]) => [name, { name, ...value }])
  ) as {
    [k in keyof Schema]: Schema[k] & { name: k };
  },
});

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
