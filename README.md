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
#or
node install nodeqb
```


## Usage

```javascript
const NodeQB = require("nodeqb");
//ES6
//import NodeQB from "nodeqb";

const db = new NodeQB({
    type: "mysql", //database type "mysql|mongo" 
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
console.log(result) //you will get result 

//or

db.table('tableName').get((err,results,fields)=>{
   if (err){
      return
   }
   console.log(results) //you will get result
})
```

## Error Handling
You could handle the all error via catch function as well callback

checkout the [Error response object](https://www.npmjs.com/package/mysql#error-handling)

In error object. we have one custom key for detecting error type
```javascript
 err.errorType // "connection"|"query" 
```
* connection -> `connection failure error`
* query      -> `query related errors`

```javascript
//Callback error
db.table('tableName').get((err,results,fields)=>{
   if (err){  
      console.log(err.errorType) //you got the error type
      return
   }
   console.log(results) //you will get result
})

//Catch error for using await
const result =await db.table('tableName').get().catch(err=>{
   if (err){
      console.log(err.errorType) //you got the error type
   }
})
console.log(result) //while got error this undefined

if (result){
   //do stuff here
}
```

## Escape 

>**Note:*** 
All these type of `where`,`having` inputs escaped with mysql escape string method. So no need escape `string/object/callback` inside this method. 
> If you are using escape again it in this method maybe you have query error

If you need escape method
```javascript
 db.escapeAll(passYourInput) //supported inputs []|{}|string|number
```



## Methods

### **`.getQuery()`**

Get the compiled final query output sql string
```javascript
const query = db.table('tableName').select('colA','colB').getQuery()
console.log(query) 
// SELECT colA,colB FROM tableName
```


***We will update the other documentation soon...***

## Author

 **prasanth**

* Github: [@prasanthreact](https://github.com/prasanthreact)

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
