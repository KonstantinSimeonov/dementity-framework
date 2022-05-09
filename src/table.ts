import { entries } from './util/entries';
import { ColumnType } from './columns';
import { AnyTable } from './types';
import { create_model } from './columns';
import { SQLQuery, BaseQuery } from './types'

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

const to_sql = {
  limit: (t: BaseQuery) => (t.limit ? `LIMIT ${t.limit | 0}` : ``),
  fields: (t: BaseQuery) =>
    !t.selected
      ? `*`
      : entries(t.selected)
          .map(([name, { value }]) => `${value} as ${String(name)}`)
          .join(`, `),
  joins: (t: BaseQuery) =>
    t.on.map(jt => `join ${jt.table.name} on ${jt.on.value}`).join(` `),
  filter: (t: BaseQuery) => (t.filter ? `where ${t.filter.value}` : ``),
};

export const make_table = <Tab extends BaseQuery>(t: Tab): SQLQuery<Tab, {}> => {
  return {
    ...t,
    original_model: t.model,

    select: fn => make_table({ ...t, selected: fn(t.model, t.joins) }),

    where: fn => make_table({ ...t, filter: fn(t.joins) }),

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

    limit: limit => make_table({ ...t, limit }),

    to_sql: () => {
      const query_parts = [
        `select`,
        to_sql.fields(t),
        `from`,
        t.name,
        to_sql.joins(t),
        to_sql.filter(t),
        to_sql.limit(t),
      ];

      return `${query_parts.filter(Boolean).join(` `)};`;
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
