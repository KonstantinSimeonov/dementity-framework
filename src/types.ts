import { AnyModel, BooleanModel, ColumnType } from './columns';

type AnyRecord = Record<string, AnyModel>;

export type AnyTable = {
  name: string;
  model: Record<string, AnyModel>;
  schema: Record<string, ColumnType>;
};

export type BaseQuery = {
  name: string;
  model: AnyRecord;
  om: AnyRecord;
  filter?: BooleanModel;
  joins: {};
  limit?: number;
  selected?: AnyRecord;
  on: { on: BooleanModel; table: AnyTable }[];
};

export type SQLQuery<
  Query extends BaseQuery,
  Joins extends Record<string, AnyRecord>,
  debug = 1
> = Omit<Query, 'select' | 'join' | 'where' | 'to_sql' | 'joins'> & {
  _debug?: debug;
  joins: Joins;

  select<T extends AnyRecord>(
    fn: (model: Query['model'], joins: Joins) => T
  ): Omit<SQLQuery<Query, Joins>, 'selected'> & { selected: T };

  join<T1 extends AnyTable>(
    t1: T1,
    fn: (
      joins: Joins &
        Record<Query['name'], Query['model']> &
        Record<T1['name'], T1['model']>
    ) => BooleanModel
  ): SQLQuery<
    Query,
    Record<Query['name'], Query['model']> &
      Joins &
      Record<T1['name'], T1['model']>
  >;

  where(
    fn: (model: Joins) => BooleanModel
  ): Omit<SQLQuery<Query, Joins>, 'filter'> & { filter: BooleanModel };

  limit<N extends number>(
    limit: N
  ): Omit<SQLQuery<Query, Joins>, 'limit'> & { limit: N };

  to_sql(): string;
};
