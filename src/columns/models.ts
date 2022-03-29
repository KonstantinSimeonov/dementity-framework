import { varchar, integer, boolean } from "./definitions";
import { AnyTable } from "../types";
import { entries } from "../util/entries";
import {ColumnType} from ".";

type VarcharModel = {
  meta: ReturnType<typeof varchar>
  value: string
  name: string
  toUpperCase: () => VarcharModel
  substring: (start: number, end?: number) => VarcharModel
  startsWith: (m: VarcharModel | string) => VarcharModel
}

export const varchar_model = (
  meta: ReturnType<typeof varchar>,
  value: string,
  name: string
): VarcharModel => ({
  meta,
  name,
  value,
  toUpperCase: () => varchar_model(meta, `upper(${value})`, name),
  substring: (start, end) => {
    return varchar_model(
      meta,
      `substring(${value}, ${start}${end !== undefined ? `, ${end}` : ``})`,
      name
    );
  },
  startsWith: m => varchar_model(
    meta,
    `${value} like '${typeof m === `string` ? m : m.value}'`,
    name,
  )
});

export const integer_model = (
  meta: ReturnType<typeof integer>,
  value: string,
  name: string
) => ({
  meta,
  name,
  value,
  round: (precision: number) =>
    integer_model(meta, `round(${name}, ${precision})`, name),
});

type BooleanModel = {
  meta: ReturnType<typeof boolean>
  value: string
  name: string
  and: (right: BooleanModel) => BooleanModel
}

export const boolean_model = (
  meta: ReturnType<typeof boolean>,
  value: string,
  name: string
): BooleanModel => ({
  meta,
  name,
  value,
  and: right =>
    boolean_model(meta, `${value} and ${right.value}`, name)
})

export const create_model = <Table extends AnyTable = AnyTable>(table: Table) =>
  Object.fromEntries(
    entries(table.schema).map(([name, c]) => {
      switch (c.type) {
        case "varchar":
          return [name, varchar_model(c, name, name)];
        case "integer":
          return [name, integer_model(c, name, name)];
        case "boolean":
          return [name, boolean_model(c, name, name)];
      }
    })
  ) as {
    [k in keyof Table["schema"]]: ReturnType<
      Table["schema"][k] extends { type: "varchar" }
        ? typeof varchar_model
        : Table["schema"][k] extends { type: "boolean" }
          ? typeof boolean_model
          : typeof integer_model
    >;
  };

export type AnyModel = ReturnType<typeof boolean_model | typeof integer_model | typeof varchar_model>

export type ToJS<T extends AnyTable> = {
  [k in keyof T['schema']]: ({
    varchar: string
    integer: number
    boolean: boolean
  }[T['schema'][k]['type']])
}
