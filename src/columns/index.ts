import * as defs from "./definitions";

export * from "./definitions";

export type ColumnType = ReturnType<typeof defs[keyof typeof defs]>;
