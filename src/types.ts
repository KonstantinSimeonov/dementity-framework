import { AnyModel, ColumnType } from "./columns";

export type AnyTable = { name: string; model: Record<string, AnyModel> };
