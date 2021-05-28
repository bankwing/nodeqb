<h1 align="center" style="margin-top:50px">Welcome to NodeQB </h1>
<p align="center" >
  <a href="https://www.npmjs.com/package/nodeqb" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/nodeqb.svg">
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> Query builder for node mysql. Inspired concept from laravel

### Note: ***Still under testing. Don't use it on production***

<br/>

## Install

```sh
yarn add nodeqb

or

node install nodeqb
```


## Usage

```javascript
import NodeQB from "nodeqb";

const db = new NodeQB({
    database: "mysql",
    method: "pool", // preferred use pool method
    defaults: {
        orderColumn: "createdAt" //for default ordering column -> optional
    },
    config: {
        host: 'your-host',
        port: 'your-port',
        database: "your-database",
        user: 'your-username',
        password: 'your-password',
        connectionLimit: 10, //increase connection as per your application
    }
})

```

## Documentation

Maximum all support function from [laravel query builder](https://laravel.com/docs/8.x/queries). 

## How to use 

Replace the `->` and `::` with `.`

**In php laravel** 
```phpt
 DB::table('tableName')->get()
```

**In NodeQB** 

prefer use `table()` call on first. It will reset the previous query value

```javascript
 db.table('tableName').get()
```

### Await / callback
we are supporting both await and callback method
```javascript
const result =await db.table('tableName').get();
console.log(query) //you will get result 

//or

db.table('tableName').get((err,results,fields)=>{
   if (err){
      return
   }
   console.log(results) //you will get result
})
```


***We will update the other documentation soon...***

## Author

 **prasanth**

* Github: [@prasanthreact](https://github.com/prasanthreact)

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
