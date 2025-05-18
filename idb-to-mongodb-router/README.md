indexeddb-to-mongodb-router
Intercept indexeddb calls and convert them to remote mongo db calls via http proxy

About
Suppose when browser does not support indexeddb, or you want to sync all your data from browser db to server side remote db(in this case mongo db). This javascript library provides abstraction for that
Server side code can be replaced to use any other db besides mongo
Usage
Include serverDb.js in your html file.

Replace your code to initialize indexed db below

var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB

with the code as below

var indexedDb = serverDb.db;