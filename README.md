<h1 align="center">Welcome to nodeqb 👋</h1>
<p align="center">
  <a href="https://www.npmjs.com/package/nodeqb" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/nodeqb.svg">
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> Query builder for node mysql. Inspired concept from laravel

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


## Author

👤 **prasanth**

* Github: [@prasanthreact](https://github.com/prasanthreact)

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
