import NodeQB from './index';
import {Connection, ConnectionConfig, FieldInfo, MysqlError, PoolConfig, PoolConnection, QueryOptions} from 'mysql';
import MysqlConnection from './database/mysql';

export type method = 'pool' | 'default';

export namespace NodeQBConnectionInterface {
    export interface Constructor {
        type: keyof database;
        config: config;
        prevent?: boolean;
        defaults?: defaults;
        method?: method;
    }

    export interface database {
        mysql: MysqlConnectionInterface;
    }

    export interface defaults {
        orderColumn?: string | Array<string>;
    }

    export interface Join {
        (joinTable: string, callbackOrId: any, condition?: string, secondaryId?: string, mode?: Joins): NodeQB;
    }
}
export type config = ConnectionConfig & PoolConfig;
export type Joins = 'INNER JOIN' | 'LEFT JOIN' | 'RIGHT JOIN';

export interface MysqlConnectionInterface {
    getInstance(callback?: (err: MysqlError) => void): MysqlConnection;
}

export type ReturnModeTypes = 'single' | 'default' | 'insert';

export type ReturnModeObjInterface = {
    [key in ReturnModeTypes]: keyof MysqlConnection;
};
export type mysqlCustomQueryCallback = (err: MysqlErrorCustom | null, results?: any, fields?: FieldInfo[]) => void;

export interface ExecInterface {
    returnMode?: ReturnModeTypes;
    callback?: mysqlCustomQueryCallback;
    value?: string;
}

export interface MysqlErrorCustom extends MysqlError {
    errorType: errorType
}

export type errorType = "connection" | "query";
export type Condition = 'AND' | 'OR';
export type columns = Array<string> | Array<object>;


export interface MysqlQueryMethod {
    options: QueryOptions;
    callback?: mysqlCustomQueryCallback;
    returnMode?: ReturnModeTypes;
    value?: any;
}


export interface QueryExec {
    connection: PoolConnection | Connection;
    resolve: any;
    reject: any;
    callback?: mysqlCustomQueryCallback;
    options: QueryOptions;
    returnMode?: ReturnModeTypes;
    value?: string;
}


export type ExecInterfaceSingleView = {
    returnMode: 'single';
    callback?: mysqlCustomQueryCallback
    value: string;
};
