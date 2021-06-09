import mysql, {Connection, FieldInfo, MysqlError, PoolConnection, QueryOptions} from 'mysql';
import {config, method, MysqlErrorCustom, MysqlQueryMethod, NodeQBConnectionInterface, QueryExec} from '../types';
import {errorTypeAdd, queryErrorThrower, spaceRemover} from '../helper';

class MysqlConnection {
    _sql: string | undefined;
    _queryOptions: QueryOptions | any;
    _select: any[] | string | undefined;
    _defaults: NodeQBConnectionInterface.defaults | undefined;
    _table: string | undefined;
    _where: string | number | undefined;
    _limit: string | undefined;
    _group: string | undefined;
    _order: string | undefined;
    _insert: string | undefined;
    _update: string | undefined;
    _having: string | undefined;
    _offset: string | undefined;
    _delete: string | undefined;
    _join: string | undefined;
    _union: string | undefined;
    private _method: method | undefined;
    private _conn: PoolConnection | Connection | any = null;
    private _connectStatus: boolean = false;

    constructor() {
        this.init();
    }

    init() {
        this._select = '';
        this._table = '';
        this._where = '';
        this._limit = '';
        this._offset = '';
        this._group = '';
        this._order = '';
        this._insert = '';
        this._update = '';
        this._having = '';
        this._join = '';
        this._sql = '';
        this._delete = '';
        this._union = '';
        this._queryOptions = {};
    }

    getInstance(config: config, method?: method, defaults?: NodeQBConnectionInterface.defaults) {
        this._method = method;
        this._defaults = defaults;
        if (method === 'pool') {
            this._conn = mysql.createPool(config);
        } else {
            this._conn = mysql.createConnection(config);
        }
    }

    createConnection() {
        return new Promise((resolve, reject) => {
            this._conn.connect((err: MysqlError) => {
                if (err) {
                    reject(err)
                    return;
                }
                this._connectStatus = true;
                resolve(this._conn);
            })
        })
    }

    createPool() {
        return new Promise((resolve, reject) => {
            this._conn.getConnection((err: MysqlError, connection: PoolConnection): void => {
                if (err) {
                    reject(err);
                    return
                }
                resolve(connection)
            });
        })
    }

    _query(props: MysqlQueryMethod) {
        const {callback, options, returnMode, value} = props;
        return new Promise((resolve, reject) => {
            if (this._method === 'pool') {
                this.createPool().then((poolConnection: any) => {
                    this._queryExec({
                        connection: poolConnection,
                        reject,
                        resolve,
                        callback,
                        options,
                        returnMode,
                        value
                    });
                }).catch((e: MysqlErrorCustom) => {
                    reject(errorTypeAdd(e, "connection"))
                })
            } else {
                this.createConnection().then((connection: any) => {
                    this._queryExec({connection, reject, resolve, callback, options, returnMode, value})
                }).catch((e: MysqlErrorCustom) => {
                    reject(errorTypeAdd(e, "connection"))
                })
            }
        }).catch((e: MysqlErrorCustom) => {
            queryErrorThrower(e, callback, (e?.errorType ? e.errorType : "query"))
        })
    }

    _singleQuery(props: MysqlQueryMethod) {
        return this._query({...props, returnMode: 'single'});
    }

    _insertQuery(props: MysqlQueryMethod) {
        return this._query({...props, returnMode: 'insert'});
    }

    _queryOptionsBuild(options?: QueryOptions) {
        this._generateSql();
        this._queryOptions = {
            sql: this._sql,
            ...options,
        };
    }

    getPrimary() {
        let sql = `SHOW KEYS ${this._table} WHERE Key_name = 'PRIMARY'`;
        return this._singleQuery({
            options: {
                sql,
            },
            value: 'Column_name',
        });
    }

    _generateSql(): MysqlConnection {
        this._sql = this.getSql();
        return this;
    }

    format(str: string, value: Array<any>) {
        return mysql.format(str, value);
    }

    _escape(a:any|any[]):void|string {
        return mysql.escape(a);
    }

    getSql(): string {
        let str = '';
        this._where = this._where ? `WHERE ${this._where.toString().replace('WHERE', '')}` : '';
        if (this._sql) {
            str = this._sql;
        } else if (this._insert) {
            str = `INSERT INTO ${this._table} SET ${this._insert}`;
        } else if (this._update) {
            str = `UPDATE ${this._table} ${this._join} SET ${this._update} ${this._where} `;
        } else if (this._delete) {
            this._table = this._table ? `FROM ${this._table.toString().replace('FROM', '')}` : '';
            str = `${this._delete} ${this._table} ${this._join} ${this._where} `;
        } else {
            this._select = this._select ? `SELECT ${this._select.toString().replace('SELECT', '')}` : 'SELECT *';
            this._table = this._table ? `FROM ${this._table.toString().replace('FROM', '')}` : '';
            this._having = this._having ? `HAVING ${this._having.toString().replace('HAVING', '')}` : '';
            str = ` ${this._select} ${this._table} ${this._join} ${this._where} ${this._order} ${this._group} ${this._limit} ${this._offset} ${this._having} ${this._union}`;
        }
        return spaceRemover(str);
    }

    private _queryExec(props: QueryExec) {
        const {connection, options, returnMode, reject, value, callback, resolve} = props;
        connection.query(options, (err: MysqlError, results: any, field: FieldInfo[]) => {
            if (this._method === 'pool') {
                if ('release' in connection) {
                    connection.release();
                }
            } else {
                this._conn.destroy();
            }
            if (err) {
                reject(err)
                return;
            }
            let res: any = results;
            if (returnMode) {
                res = returnMode === 'insert' ? results : results[0];
                if (value) {
                    res = res[value];
                }
            }
            if (callback) {
                callback(err, res, field);
            }
            resolve(res);
        })
    }

    private _value(value?: any) {
        return (res?: any) => {
            if (typeof value !== undefined) {
                return res;
            }
            let values: any[] = [];
            if (Array.isArray(value)) {
                values = value;
            } else {
                values = value.split(' ').join(',').split(',');
            }
            const filterResult: any = {};
            values.forEach((a: string) => {
                filterResult[a] = res[a];
            });
            return filterResult;
        };
    }

}

export = MysqlConnection;
