# Perch Engineering Assignment

A simple RESTFUL API using [ExpressJS](https://expressjs.com/) in TypeScript connecting a Postgres Database. The ORM used is [sequelize-typescript](https://github.com/sequelize/sequelize-typescript).

## Setting Up

### Setup Postgres Database

* Install [Docker Desktop](https://www.docker.com/products/docker-desktop) if you don't already have Docker.
* Start the database using Docker depending on your CPU type
  * amd64 (Intel CPU):

    ```bash
    docker run --name perch-assignment-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgis/postgis:14-3.3
    ```

  * arm64 (Apple CPU):

    ```bash
    docker run --name perch-assignment-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d ghcr.io/baosystems/postgis:14-3.3
    ```

  * This will start a Postgres database running on port 5432 (default for postgres).

### Install Prerequisites

You will need Node 20 available on your machine/environment.

```bash
npm install -g ts-node
```

### Setup the API

```bash
npm install && npm run db:setup:all
```

## Check Lint

```bash
npm run lint
```

## Check Tests

```bash
npm test
```

## Start the Development server

```bash
npm run dev
```

The API endpoint http://localhost:3000/v1/people should now be available.

## Reset the database after making data model changes

```bash
npm run db:sync
```

## What's in the repo?

* `src/database/models` contains a sample data model `Person`
* `src/api` contains the endpoint routing
* `test/` contains jest tests
