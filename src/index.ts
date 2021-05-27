import {
    columns,
    Condition,
    ExecInterface,
    NodeQBConnectionInterface,
    ReturnModeObjInterface
} from "./types/typeInterface";
import MysqlConnection from "./database/mysql";
import {ConnectionConfig, PoolConfig, queryCallback} from "mysql";
import {spaceRemover} from "./helper/basicHelper";

const op = ['>', '<', '>=', '<=', '!=', '=', 'like'];

const connectionDB = {
    mysql: () => new MysqlConnection()
}


type ExecInterfaceSingleView = {
    returnMode: "single"
    callback?: queryCallback
    value: string
}


const returnModeObj: ReturnModeObjInterface = {
    single: "_singleQuery",
    default: "_query",
    insert: "_insertQuery"
}


class NodeQB {

    private _instance: MysqlConnection;
    private _database: "mysql";
    private _config: ConnectionConfig & PoolConfig;
    private _prevent: boolean | undefined;

    constructor({database, defaults, config, method, prevent}: NodeQBConnectionInterface.Constructor) {
        this._database = database;
        this._config = config;
        this._prevent = prevent
        if (typeof connectionDB[database] === 'undefined') {
            throw new Error(`Invalid database connection name ${database}`);
            return
        }
        this._instance = connectionDB[database]()
        if (!prevent) {
            this._instance.getInstance(config, method, defaults)
        }
    }

    private _createNewInstance() {
        return new NodeQB({database: this._database, config: this._config, prevent: true})
    }

    create() {
        return this._createNewInstance()
    }

    get(callback?: queryCallback) {
        return this._exec({callback})
    }

    getAll(callback?: queryCallback) {
        return this._exec({callback})
    }

    count(callback?: queryCallback) {
        this._instance._select = " count(*) as c ";
        return this._exec({callback, returnMode: "single", value: "c"})
    }

    value(columName: string) {
        this._instance._limit = "limit 1";
        return this._exec({returnMode: "single", value: columName})
    }

    pluck(key: string, value?: string) {
        if (!key) {
            return
        }
        let keyName = key;
        let valueName = value ?? key
        this._instance._select = ` ${keyName} as keyColumn, ${valueName} as valueColumn `;
        return this._exec({}).then(res => {
            return res.reduce((acc: any, {
                keyColumn,
                valueColumn
            }: { keyColumn: any, valueColumn: any }) => (acc[keyColumn] = valueColumn, acc), {})
        })
    }

    private async _exec(props: ExecInterface) {
        const {callback, returnMode = "default", value} = props;
        this._instance._queryOptionsBuild()
        const queryMode = returnModeObj[returnMode]
        if (callback) {
            this._instance[queryMode].apply(this._instance, [{options: this._instance._queryOptions, callback, value}])
        } else {
            return this._instance[queryMode].apply(this._instance, [{
                options: this._instance._queryOptions,
                callback,
                value
            }])
        }
    }

    table(tableName: string): NodeQB {
        this._instance.init()
        this._instance._table = `${tableName}`
        return this;
    }

    primary() {
        return this._instance.getPrimary()
    }

    getQuery(): string {
        return spaceRemover(this._instance.getSql())
    }

    first(callback?: queryCallback) {
        this._instance._limit = "limit 1";
        return this._exec({callback, returnMode: "single"})
    }

    private _columnPrepare(columns: any) {
        if (typeof columns !== "undefined" && Array.isArray(columns)) {
            const col = columns.flat().join(', ')
            return col
        }
        return '';
    }


    private _order(columns: Array<string> | any, sort: "ASC" | "DESC"): NodeQB {
        let col: string = '';
        if (typeof columns !== "undefined" && columns[0]) {
            col = `ORDER BY  ${this._columnPrepare(columns)} ${sort}`
        } else {
            let orderColumn = this._instance._defaults?.orderColumn
            if (orderColumn) {
                col = `ORDER BY  ${this._columnPrepare([orderColumn])} ${sort}`
            }
        }
        this._instance._order = col;
        return this;
    }

    orderByAsc(...columns: Array<string> | any): NodeQB {
        this._order(columns, "ASC")
        return this;
    }

    orderByDesc(...columns: Array<string> | any): NodeQB {
        this._order(columns, "DESC")
        return this;
    }

    groupBy(...columns: Array<string> | any): NodeQB {
        this._instance._group = ` GROUP BY ${this._columnPrepare(columns)}`
        return this;
    }

    oldest(...columns: Array<string>): NodeQB {
        let col: string | any = '';
        this.orderByAsc(...columns)
        this._instance._limit = "LIMIT 1"
        return this;
    }

    latest(...columns: Array<string>): NodeQB {
        let col: string | any = '';
        this.orderByDesc(...columns)
        this._instance._limit = "LIMIT 1"
        return this;
    }

    select(...columns: Array<string> | any): NodeQB {
        let select = ''
        if (columns[0]) {
            select = ' ' + this._columnPrepare(columns)
        }
        this._instance._select = select
        return this;
    }

    selectRaw(str: string, values: any[] = []): NodeQB {
        this._instance._select = ` ${this._instance.format(str, values)}`
        return this;
    }

    whereRaw(str: string, values: any[] = []): NodeQB {
        this._instance._where = `WHERE ${this._instance.format(str, values)}`
        return this;
    }

    havingRaw(str: string, values: any[] = []): NodeQB {
        this._instance._having = `HAVING ${this._instance.format(str, values)}`
        return this;
    }

    orderByRaw(str: string, values: any[] = []): NodeQB {
        this._instance._order = `ORDER ${this._instance.format(str, values)}`
        return this;
    }

    groupByRaw(str: string, values: any[] = []): NodeQB {
        this._instance._order = `GROUP BY ${this._instance.format(str, values)}`
        return this;
    }

    addSelect(str: string): NodeQB {
        this._instance._select += `,${str}`;
        return this;
    }


    async max(column: string) {
        return await this.select(` max(${column}) as max`).value('max');
    }

    async min(column: string) {
        return await this.select(` min(${column}) as min`).value('min');
    }

    async sum(column: string) {
        return await this.select(` sum(${column}) as s`).value('s');
    }

    avg(...columns: Array<string> | any) {
        let col = columns.flat().join('+')
        this._instance._select = ` avg(${col}) as avg`;
        return this._exec({returnMode: "single", value: 'avg'});
    }

    private _objectPrepare(columns: any) {
        if (typeof columns !== "undefined" && Array.isArray(columns)) {
            const [k, v] = columns;
            let kn = op.some(a => k.indexOf(a) > -1) ? k.replace(/(\w+)(.*)/g, '`$1` $2') : `\`${k}\` =`;
            let vn = typeof v === 'string' ? `'${v}'` : v;
            return [kn, vn].join(' ')
        }
        return '';
    }

    private _whereArrayPrepare(columns: any): string {
        let [column, secArg, thirdArg] = columns;
        let str: string = ''
        column = this._prepareKey(column)
        thirdArg = this._prepareValue(thirdArg)
        if (op.some(a => a === secArg)) {
            str = [column, secArg, thirdArg].join(' ')
        } else {
            secArg = this._prepareValue(secArg)
            str = [column, secArg].join(' = ')
        }
        return str
    }

    private _prepareValue(val: any) {
        return typeof val === 'string' ? `'${val}'` : val
    }

    private _prepareKey(col: any) {
        return `\`${col}\``
    }

    private _conditionPrepare(columns: columns, sepreator: string = 'AND') {
        let str: string = ''
        if (typeof columns[0] === 'object') {
            let col = columns.flat()
            str = Object.entries(col[0]).map((a) => this._objectPrepare(a)).join(` ${sepreator} `)
        } else {
            str = this._whereArrayPrepare(columns.flat())
        }
        return `${str}`
    }

    private _conditionCallback(columns: columns, cond: Condition, getVar: keyof MysqlConnection = '_where', setVar: keyof MysqlConnection = '_where') {
        let whereQuery = '';
        let connWord = !this._prevent && this._instance[getVar] ? cond : '';
        if (columns[0] instanceof Function) {
            const newInstance = this._createNewInstance()
            const fun = columns[0](newInstance)
            newInstance._instance._generateSql()
            const str = typeof fun == 'object' ? (fun?._instance ? fun._instance[getVar] : fun) : fun;
            const callbackQuery = `( ${str} )`;
            connWord = this._instance[getVar] ? cond : '';
            whereQuery += ` ${callbackQuery} `
        } else {
            this._prevent = false;
            whereQuery += this._conditionPrepare(columns)
        }
        this._instance[setVar] += ` ${connWord} ${whereQuery}`
        return this
    }

    where(...columns: any[]) {
        return this._conditionCallback(columns.flat(), "AND")
    }

    orWhere(...columns: any[]) {
        return this._conditionCallback(columns.flat(), "OR")
    }

    having(...columns: any[]) {
        return this._conditionCallback(columns.flat(), "AND", "_having", "_having")
    }

    orHaving(...columns: any[]) {
        return this._conditionCallback(columns.flat(), "OR", "_having", "_having")
    }


    whereColumn(...columns: any[]) {
        return this.where(...columns)
    }

    whereDate(column: string, value: string | number): NodeQB {
        this._instance._where += ` DATE(${column})= ${value}`
        return this;
    }

    whereDay(column: string, value: string | number): NodeQB {
        this._instance._where += ` DAY(${column})= ${value}`
        return this;
    }

    whereTime(column: string, value: string | number): NodeQB {
        this._instance._where += ` TIME(${column})= ${value}`
        return this;
    }

    whereYear(column: string, value: string | number): NodeQB {
        this._instance._where += ` YEAR(${column})= ${value}`
        return this;
    }

    whereMonth(column: string, value: string | number): NodeQB {
        this._instance._where += ` MONTH(${column})= ${value}`
        return this;
    }

    whereNotNull(column: string): NodeQB {
        this._instance._where += `${column} IS NOT NULL`
        return this;
    }

    whereNull(column: string): NodeQB {
        this._instance._where += `${column} IS NULL`
        return this;
    }
    whereAnd = () =>{
        this._instance._where += ` AND `
        return this;
    }
    whereOR = () =>{
        this._instance._where += ` OR `
        return this;
    }

    async exists(): Promise<boolean> {
        this.limit(1)
        return await this.count() > 0
    }

    async doesntExist(): Promise<boolean> {
        this.limit(1)
        return await this.count() === 0
    }

    whereExists(...columns: any[]) {
        if (typeof columns[0] !== 'undefined') {
            this._instance._where = "EXISTS ";
            return this._conditionCallback(columns.flat(), "AND", "_sql", "_where")
        } else {
            return this
        }
    }

    private _in(column: string, values: any[] | string = [], cond: Condition, mode: string = ''): NodeQB {
        let val = Array.isArray(values) ? values.join(',') : values;
        const condWord = this._instance._where ? cond : ''
        this._instance._where += ` ${condWord} ${column} ${mode} IN (${val})`
        return this
    }

    whereIn(column: string, values: any[] | string = []): NodeQB {
        return this._in(column, values, "AND")
    }

    orWhereIn(column: string, values: any[] | string = []): NodeQB {
        return this._in(column, values, "OR")
    }

    whereNotIn(column: string, values: any[] | string = []): NodeQB {
        return this._in(column, values, "AND", "NOT")
    }

    orWhereNotIn(column: string, values: any[] | string = []): NodeQB {
        return this._in(column, values, "OR", "NOT")
    }

    limit(number: number): NodeQB {
        this._instance._limit = `LIMIT ${number}`
        return this;
    }

    offset(number: number): NodeQB {
        this._instance._offset = `OFFSET ${number}`
        return this;
    }

    insert(insertObject: object, callback?: queryCallback) {
        this._instance._insert = this._conditionPrepare([insertObject], ",")
        return this._exec({callback})
    }

    insertGetId(insertObject: object, callback?: queryCallback) {
        this._instance._insert = this._conditionPrepare([insertObject], ",")
        return this._exec({callback, value: 'insertId', returnMode: "insert"})
    }

    update(updateObject: object, callback?: queryCallback) {
        this._instance._update = this._conditionPrepare([updateObject], ",")
        return this._exec({callback})
    }

    delete(callback?: queryCallback) {
        this._instance._delete = "DELETE"
        return this._exec({callback})
    }

    distinct(column: string): NodeQB {
        this.select(`DISTINCT ${column}`)
        return this;
    }

    truncate(callback?: queryCallback) {
        this._instance._sql = `TRUNCATE TABLE ${this._instance._table};`
        return this._exec({callback, returnMode: "insert"})
    }

    drop(callback?: queryCallback) {
        this._instance._sql = `DROP TABLE ${this._instance._table};`
        return this._exec({callback, returnMode: "insert"})
    }

    private _joinPrepare: NodeQBConnectionInterface.Join = (joinTable, idOrFun, condition, secondaryId, mode = "INNER JOIN"): NodeQB => {
        let str = '';
        if (idOrFun instanceof Function) {
            const fun = idOrFun(this._createNewInstance())
            if ("_instance" in fun) {
                str = fun._instance._join
            }
        } else {
            str = `ON ${idOrFun} ${condition} ${secondaryId} `
        }
        this._instance._join += ` ${mode} ${joinTable} ${str}`
        return this;
    }


    onJoin(...values: any[]) {
        this._instance._join += ` ON ${this._conditionPrepare(values.flat())}`
        return this
    }

    orJoin(...values: any[]) {
        this._instance._join += ` OR ${this._conditionPrepare(values.flat())}`
        return this
    }

    andJoin(...values: any[]) {
        this._instance._join += ` AND ${this._conditionPrepare(values.flat())}`
        return this
    }

    join: NodeQBConnectionInterface.Join = (...props): NodeQB => {
        return this._joinPrepare(...props)
    }
    leftJoin: NodeQBConnectionInterface.Join = (...props): NodeQB => {
        props.push('mode', "LEFT JOIN")
        return this._joinPrepare(...props)
    }

    righJoin: NodeQBConnectionInterface.Join = (...props): NodeQB => {
        props.push('mode', "RIGHT JOIN")
        return this._joinPrepare(...props)
    }

    skip(number: number): NodeQB {
        this.offset(number)
        return this;
    }

    take(number: number): NodeQB {
        this.limit(number)
        return this;
    }

    union(query: InstanceType<any>): NodeQB {
        let q = query;
        if ('getQuery' in query) {
            q = query.getQuery();
        }
        this._instance._union = `UNION ${q}`
        return this;
    }
}

export default NodeQB
