export const varchar = (length: number) =>
  ({
    length,
    type: `varchar`,
    sql_type: `varchar(${length})`,
  } as const);

export const integer = () =>
  ({
    type: `integer`,
    sql_type: `integer`,
  } as const);

export const boolean = () => ({
  type: `boolean`,
  sql_type: `boolean`
}) as const
