import { varchar, integer, boolean } from './definitions';
import { AnyTable } from '../types';
import { entries } from '../util/entries';

export type VarcharModel = {
  meta: ReturnType<typeof varchar>;
  value: string;
  name: string;
  toUpperCase: () => VarcharModel;
  substring: (start: number, end?: number) => VarcharModel;
  startsWith: (m: VarcharModel | string) => BooleanModel;
  eq: (m: VarcharModel | string) => BooleanModel;
  length: () => IntegerModel;
};

export const varchar_model = (
  meta: ReturnType<typeof varchar>,
  value: string,
  name: string
): VarcharModel => ({
  meta,
  name,
  value,
  length: () => integer_model(integer(), `length(${value})`, name),
  toUpperCase: () => varchar_model(meta, `upper(${value})`, name),
  substring: (start, end) => {
    return varchar_model(
      meta,
      `substring(${value}, ${start}${end !== undefined ? `, ${end}` : ``})`,
      name
    );
  },
  startsWith: m =>
    boolean_model(
      boolean(),
      `${value} like '${typeof m === `string` ? m : m.value}%'`,
      name
    ),
  eq: m =>
    boolean_model(
      boolean(),
      `${value} = ${typeof m === 'string' ? `"${m}"` : m.value}`,
      name
    ),
});

export type IntegerModel = {
  meta: ReturnType<typeof integer>;
  name: string;
  value: string;
  round: (precision: number) => IntegerModel;
  gt: (m: IntegerModel | number) => BooleanModel;
};

export const integer_model = (
  meta: ReturnType<typeof integer>,
  value: string,
  name: string
): IntegerModel => ({
  meta,
  name,
  value,
  round: (precision: number) =>
    integer_model(meta, `round(${name}, ${precision})`, name),
  gt: m =>
    boolean_model(
      boolean(),
      `${value} > ${typeof m === `number` ? m : `${m.value}`}`,
      name
    ),
});

export type BooleanModel = {
  meta: ReturnType<typeof boolean>;
  value: string;
  name: string;
  and: (right: BooleanModel) => BooleanModel;
  or: (right: BooleanModel) => BooleanModel;
};

export const boolean_model = (
  meta: ReturnType<typeof boolean>,
  value: string,
  name: string
): BooleanModel => ({
  meta,
  name,
  value,
  and: right => boolean_model(meta, `${value} and ${right.value}`, name),
  or: right => boolean_model(meta, `${value} or ${right.value}`, name),
});

export const create_model = <
  Schema extends AnyTable['schema'],
  Name extends string
>(
  schema: Schema,
  table_name: Name
) =>
  Object.fromEntries(
    entries(schema).map(([name, c]) => {
      const n = `${table_name}.${name}`;
      switch (c.type) {
        case 'varchar':
          return [name, varchar_model(c, n, n)];
        case 'integer':
          return [name, integer_model(c, n, n)];
        case 'boolean':
          return [name, boolean_model(c, n, n)];
      }
    })
  ) as {
    [k in keyof Schema]: {
      varchar: VarcharModel;
      integer: ReturnType<typeof integer_model>;
      boolean: BooleanModel;
    }[Schema[k]['type']];
  };

export type AnyModel = ReturnType<
  typeof boolean_model | typeof integer_model | typeof varchar_model
>;

export type ToJS<T extends AnyTable> = {
  [k in keyof T['schema']]: {
    varchar: string;
    integer: number;
    boolean: boolean;
  }[T['schema'][k]['type']];
};
