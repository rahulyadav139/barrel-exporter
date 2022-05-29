



<div align="center">

# Barrel Exporter

Package for implementing barrel exporting in React, Next JS.

_A barrel is a way to rollup exports from several modules into a single convenient module. The barrel itself is a module file that re-exports selected exports of other modules._

![Forks](https://img.shields.io/github/forks/rahulyadav139/barrel-exporter)
![Stars](https://img.shields.io/github/stars/rahulyadav139/barrel-exporter)

</div>

---



## Installation


```console
  $ npm install --save-dev barrel-exporter
```

## Usage


Add a script in package.json 

You can set any custom script name like: 
```json
"scripts": {
"exporter" : "barrel-exporter"
}
```

Run command in console that will create index.js file in the folder where you want to implement barrel exporting

```console
$ npm run exporter --path=src/pages
```
Set path in command where you want barrel exporting.



After executing the command, an index.js file is created with multiple named export at the given path. ( in this case: src/pages/index.js )

```js
export { AuthPage } from './AuthPage.js';
export { HomePage } from './HomePage.js';
```

## Without Barrel Exporting

Without implementing barrel exporting, files will be imported one by one from different source modules.

### Tree Diagram

pages <br/>
|---AuthPage.js <br/>
|---HomePage.js <br/>

### The way to import files

```js
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
```




## With Barrel Exporting

With implementing barrel exporting, files will be imported all at once from a single source module.

### Tree Diagram


pages <br/>
|---index.js <br/>
|---AuthPage.js <br/>
|---HomePage.js <br/>

### The way to import files

```js
import { AuthPage, HomePage } from './pages'
```

## What it solves?

If you want to implement barrel exporting then you need to create Index.js file and then manually export all the files with correct path. But with **Barrel Exporter**, Index.js file is automatically created with correct exporting and path. Isn't it amazing!!

## Features

- Option provided to overwrite already existing index file
- .js and .jsx file extension supported
- No external dependency

---