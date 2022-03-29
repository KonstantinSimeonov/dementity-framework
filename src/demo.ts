import { varchar, integer, boolean, ColumnType } from "./columns";
import { create_model } from "./columns/models";
import { AnyTable } from "./types";
import { make_schema } from "./table"
import { entries } from "./util/entries";

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
  `create table ${table.name} (\n${entries(table.schema)
    .map(([name, f]) => `  ${name} ${handle_constraints(f)}`)
    .join(`,\n`)}\n);`;

const m = create_model(sc);

console.log(m.name.toUpperCase().substring(2));

console.log(m.name.startsWith(`Vancho`))

console.log(create_table(sc));
