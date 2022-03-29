// TODO: union type
type CommonColumnConstraints = {
  not_null?: boolean
  primary_key?: true
  unique?: boolean
}

export const varchar = (length: number, constraints: CommonColumnConstraints = {}) =>
  ({
    constraints,
    length,
    type: `varchar`,
    sql_type: `varchar(${length})`,
  } as const);

export const integer = (constraints: CommonColumnConstraints = {}) =>
  ({
    constraints,
    type: `integer`,
    sql_type: `integer`,
  } as const);

export const boolean = (constraints: CommonColumnConstraints = {}) => ({
  constraints,
  type: `boolean`,
  sql_type: `boolean`
}) as const
