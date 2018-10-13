ScreenOn docs
=============

## Introduction

ScreenOn is an application to measure and evaluate
how much time someone is using their smartphone.

Technically speaking, it is composed of two different
software parts:

* an Automate applet, running on the phone, recording screen usage data
* a Flask.py+Polymer2 web application to access the data
  and see several charts and statistics

## Database

### Create and update the database. 

ScreenOn uses an SQLite3 database.
The database can be created by invoking the following command:

```
$ sqlite3 screenon.db < screenon/schema.sql
```

The same command can be also used to apply schema changes,
until we move to something more well-suited to this.
The only recommendation is to **only add** commands to the schema file:
don't modify the base table, but only alter tables using consecutive
SQL DDL statements.

## Development

### Run browser tests

To run tests, open a terminal and execute the following command:

```
polymer test
```

This command will start the predefined browser (eg Firefox) via Selenium,
a library to run automated tests in a browser.