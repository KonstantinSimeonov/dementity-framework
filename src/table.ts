import { entries } from "./util/entries";
import { AnyModel, BooleanModel, ColumnType, VarcharModel } from "./columns";
import { AnyTable } from "./types";
import { create_model } from "./columns";

type AnyJoin = { on: BooleanModel; table: AnyTable };

type AnyRecord = Record<string, AnyModel>;

export const make_schema = <
  Name extends string,
  Schema extends Record<string, ColumnType>
>(
  name: Name,
  input: Schema
) => {
  const schema = Object.fromEntries(
    entries(input).map(([name, value]) => [name, { name, ...value }])
  ) as {
    [k in keyof Schema]: Schema[k] & { name: k };
  };

  const model = create_model(schema, name);
  return make_table({
    name,
    model,
    schema,
    om: model,
    joins: { [name]: model },
    on: [],
  });
};

type BaseTable = {
  name: string;
  model: AnyRecord;
  om: AnyRecord;
  filter?: BooleanModel;
  joins: {};
  limit?: number
  on: any;
};

type MT<
  Table extends BaseTable,
  Joins extends Record<string, AnyRecord>,
  debug = 1
> = Omit<Table, "select" | "join" | "where" | "to_sql" | "joins"> & {
  _debug?: debug;
  joins: Joins;
  select<T extends AnyRecord>(
    fn: (model: Table["model"], joins: Joins) => T
  ): Omit<MT<Table, Joins>, "model"> & { model: T };

  join<T1 extends AnyTable>(
    t1: T1,
    fn: (
      joins: Joins &
        Record<Table["name"], Table["model"]> &
        Record<T1["name"], T1["model"]>
    ) => BooleanModel
  ): MT<
    Table,
    Record<Table["name"], Table["model"]> &
      Joins &
      Record<T1["name"], T1["model"]>
  >;

  where(
    fn: (model: Joins) => BooleanModel
  ): Omit<MT<Table, Joins>, "filter"> & { filter: BooleanModel };

  limit<N extends number>(limit: N): Omit<MT<Table, Joins>, "limit"> & { limit: N }

  to_sql(): string;
};

export const make_table = <Tab extends BaseTable>(t: Tab): MT<Tab, {}> => {
  return {
    ...t,
    original_model: t.model,

    select: (fn) => make_table({ ...t, model: fn(t.model, t.joins) }),

    where: (fn) => make_table({ ...t, filter: fn(t.joins) }),

    join: (table, fn) => {
      const joins = { ...t.joins, [table.name]: table.model };
      return make_table({
        ...t,
        joins,
        on: [
          ...t.on,
          {
            table,
            on: fn(joins as any),
          },
        ],
      }) as any;
    },

    limit: (limit) => make_table({ ...t, limit }),

    to_sql: () => {
      const fields = entries(t.model);
      const sql_fields = fields
        .map(
          ([name, { value }]) =>
            `${value} as ${name}`
        )
        .join(`, `);

      const joins = t.on.map(
        (jt: any) => `join ${jt.table.name} on ${jt.on.value}`
      ).join(' ');

      return `select ${sql_fields} from ${t.name} ${joins} ${
        t.filter ? ` where ${t.filter.value}` : ``
      } ${t.limit ? `limit ${t.limit}` : ``};`;
    },
  };
};

const handle_constraints = ({ constraints, sql_type }: ColumnType) =>
  [
    sql_type,
    constraints.not_null && `not null`,
    constraints.unique && `unique`,
    constraints.primary_key && `primary key`,
  ]
    .filter(Boolean)
    .join(` `);

export const create_table = <Table extends AnyTable>(table: Table) =>
  `create table if not exists ${table.name} (\n${entries(table.schema)
    .map(([name, f]) => `  ${name} ${handle_constraints(f)}`)
    .join(`,\n`)}\n);`;
