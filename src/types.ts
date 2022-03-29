import { ColumnType } from "./columns";

export type AnyTable = { name: string; schema: Record<string, ColumnType> };
