# Perch Technical Interview — Task List App

A Task list app with an Angular frontend and an ExpressJS/TypeScript API backed by Postgres.

- `backend/` — ExpressJS API
- `frontend/` — Angular app

## Running the app

Everything runs via Docker Compose — Postgres, the API, and the Angular dev server.

1. Copy the env template and adjust if needed:

   ```bash
   cp .env.sample .env
   ```

   This `.env` file supplies the Postgres root credentials and the credentials for a
   dedicated, less-privileged `api_user` database role that the API actually connects
   as. It's gitignored since it holds credentials — `.env.sample` is the committed
   template.

2. Start everything:

   ```bash
   docker compose up --build
   ```

   This builds the `api` and `app` images and starts three containers:
   - `postgres` — Postgres/PostGIS, exposed on `5432`. On first startup (empty
     volume only — these scripts never re-run on restart) it runs, in order:
     - `db-init/00-create-api-user.sh` — creates the `api_user` role and the
       `web-boilerplate` / `web-boilerplate-test` databases.
     - `db-init/01-seed-tasks.sh` — creates the `Task` table and inserts ~28
       sample tasks, so the app has real data to show immediately with zero
       manual steps.
   - `api` — the Express API (nodemon, hot-reload), exposed on `3000`.
   - `app` — the Angular dev server, exposed on `4200`.

3. Open the app at [http://localhost:4200](http://localhost:4200). It talks to the API
   through the dev-server proxy (`frontend/proxy.conf.js`) at `/api`, which is rewritten
   to the `api` container's `/v1` routes.

The API is also reachable directly at [http://localhost:3000](http://localhost:3000)
(e.g. `GET /v1/tasks`).

### Schema changes / more sample data

`db-init/01-seed-tasks.sh` only runs once, when Postgres initializes with an empty
volume — it won't re-run on `docker compose restart` or `up` against an existing
volume, so it can never wipe data you've added since. If you change `Task`'s model
fields, sync the schema manually:

```bash
docker compose exec api npm run db:sync
```

```bash
docker compose down -v
docker compose up --build
```

### Running backend tests

```bash
docker compose exec api npm run test:docker
```

`test:docker` overrides `DB_DATABASE` to `web-boilerplate-test` before running
Jest — plain `npm test` inside the container would otherwise run against the dev
database (`docker-compose.yml` hard-codes `DB_DATABASE=web-boilerplate` for the
`api` service). As a second line of defense, `test/_setup/database.testSetup.ts`
refuses to run at all against any database whose name doesn't end in `-test`, so
a misconfigured run fails fast instead of truncating dev data.

If the test database doesn't have the schema yet, sync it once:

```bash
docker compose exec -e DB_DATABASE=web-boilerplate-test -e NODE_ENV=test api npm run db:sync
```

### Stopping / resetting

```bash
docker compose down        # stop containers, keep data
docker compose down -v     # stop containers and wipe the Postgres volume (fresh init next run)
```

## Local (non-Docker) development / editor support

The containers install their own `node_modules` inside Docker volumes, so they don't
depend on — or get clobbered by — anything on the host. But that also means your editor
(VS Code/TypeScript) has nothing to resolve imports against unless you install
dependencies on the host too:

```bash
cd backend && npm install --ignore-scripts
cd frontend && npm install --ignore-scripts
```

**Always pass `--ignore-scripts`** when installing dependencies. `npm install`/`npm ci`
by default execute arbitrary `preinstall`/`install`/`postinstall` scripts declared by
every package (and transitive dependency) in the tree — a common supply-chain attack
vector. Passing `--ignore-scripts` skips all of that. None of this project's
dependencies require a build step to function, so there's no downside. This applies
both to host-side installs (for editor tooling) and inside the Docker images —
`backend/Dockerfile` and `frontend/Dockerfile` both run `npm ci --ignore-scripts`.
