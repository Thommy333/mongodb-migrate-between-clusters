# mongodb-migrate-between-clusters

This is a minimal approach to use Mongoose to migrate all collections and documents from one MongoDB cluster (source) to another MongoDB cluster (target).
The source cluster is mapped, and any indexes and data from the source collections are re-created inside the target cluster.

---

## Requirements

For usage, you will need Node.js (v14 or later) and NPM installed in your environement.

The project uses top-level awaits, so use a recent version of Node: >14.

## Install

    $ clone the repo
    $ npm install

## Configure app

Copy `.env.example` to `.env` and paste two valid MongoDB connection strings as environment variables accordingly.

## Running the project

    $ npm run migrate
