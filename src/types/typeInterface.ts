import NodeQB from "../index";
import {ConnectionConfig, MysqlError, PoolConfig, queryCallback} from "mysql";
import MysqlConnection from "../database/mysql";

export interface NodeQBInterface {
    table(str: string): NodeQB

    get(callback?: queryCallback): unknown

    value(str: string): unknown

    find(str: string): NodeQB

    //aggregation method
    get(callback?: queryCallback): unknown

    max(str: string): NodeQB

    avg(str: string): NodeQB

    exists(str: string): NodeQB

    doesntExist(str: string): NodeQB

    //select statement
    select(str: string): NodeQB

    distinct(str: string): NodeQB

    addSelect(str: string): NodeQB

    //raw method
    selectRaw(str: string): NodeQB

    whereRaw(str: string): NodeQB

    havingRaw(str: string): NodeQB

    groupByRaw(str: string): NodeQB

    orderByRaw(str: string): NodeQB

    //joins
    join(str: string): NodeQB

    leftJoin(str: string): NodeQB

    righJoin(str: string): NodeQB

    crossJoin(str: string): NodeQB

    //advance joins
    orOn(str: string): NodeQB

    //union
    union(str: string): NodeQB

    //where clauses
    where(str: string): NodeQB

    orWhere(str: string): NodeQB

    whereNull(str: string): NodeQB

    whereNotNull(str: string): NodeQB

    whereYear(str: string): NodeQB

    whereMonth(str: string): NodeQB

    whereDate(str: string): NodeQB

    whereDay(str: string): NodeQB

    whereTime(str: string): NodeQB

    whereColumn(str: string): NodeQB

    whereExists(str: string): NodeQB

    //Ordering, Grouping, Limit & Offset
    orderBy(str: string): NodeQB

    orderByAsc(str: string): NodeQB

    orderByDesc(str: string): NodeQB

    inRandomOrder(str: string): NodeQB

    reorder(str: string): NodeQB

    latest(str: string): NodeQB

    oldest(str: string): NodeQB

    first(str: string): NodeQB

    last(str: string): NodeQB

    //Grouping having
    groupBy(str: string): NodeQB

    having(str: string): NodeQB

    //limit and offset
    skip(str: string): NodeQB

    take(str: string): NodeQB

    offset(str: string): NodeQB

    limit(str: string): NodeQB

    //conditional
    ifNull(str: string): NodeQB

    //insert or update
    insert(str: string): NodeQB

    update(str: string): NodeQB

    insertGetId(str: string): NodeQB

    insertOrUpdate(str: string): NodeQB

    updateOrInsert(str: string): NodeQB

    increment(str: string): NodeQB

    decrement(str: string): NodeQB

    //Pessimistic Locking
    sharedLock(str: string): NodeQB

    //debug
    dd(str: string): NodeQB
}


export type method = "pool" | "default"

export namespace NodeQBConnectionInterface {
    export interface Constructor {
        database: keyof database
        config: config,
        prevent?: boolean,
        defaults?: defaults
        method?: method
    }

    export interface database {
        mysql: MysqlConnectionInterface
    }

    export interface defaults {
        orderColumn?: string | Array<string>
    }

    export interface Join {
        (joinTable: string, callbackOrId: any, condition?: string, secondaryId?: string,mode?:Joins): NodeQB
    }
}
export type config = ConnectionConfig & PoolConfig;
export type Joins = "INNER JOIN"|"LEFT JOIN"|"RIGHT JOIN"

export interface MysqlConnectionInterface {
    getInstance(callback?: (err: MysqlError) => void): MysqlConnection
}


export type ReturnModeTypes = "single" | "default" | "insert";

export type ReturnModeObjInterface = {
    [key in ReturnModeTypes]: keyof MysqlConnection;
};

export interface ExecInterface {
    returnMode?: ReturnModeTypes,
    callback?: queryCallback
    value?: string
}

export type Condition = "AND" | "OR"
export type columns = Array<string> | Array<object>
