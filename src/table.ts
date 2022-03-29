import { entries } from "./util/entries";
import { ColumnType } from "./columns";

export const make_schema = <
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
