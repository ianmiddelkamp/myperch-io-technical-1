#!/bin/bash
set -e

# Runs as $API_DB_USER (owner of $API_DB_NAME) so the table it creates is
# owned by the same role the api service connects as, avoiding any grant
# headaches. Table shape mirrors backend/src/database/models/task.model.ts.
psql -v ON_ERROR_STOP=1 --username "$API_DB_USER" --dbname "$API_DB_NAME" <<-EOSQL
  CREATE TABLE IF NOT EXISTS "Task" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  INSERT INTO "Task" (title, description, completed) VALUES
    ('Set up docker-compose for postgres, api, and app', 'One command to run the whole stack: docker compose up', true),
    ('Create a dedicated api_user database role', 'API connects as a least-privilege role instead of the postgres superuser', true),
    ('Fix stale gitlink entries', 'backend and frontend were leftover submodule references, not real folders in the index', true),
    ('Document and enforce npm install --ignore-scripts', 'Skips arbitrary install-time scripts from the dependency tree', true),
    ('Fix nodemon not reloading on file changes', 'Docker Desktop on Windows does not forward file events through the bind mount; needed legacyWatch polling', true),
    ('Fix the Angular dev server not reloading either', 'Same root cause; needed --poll=1000 on ng serve', true),
    ('Fix the dev-server proxy silently dropping /api requests', 'context needed to be an array of strings, not a bare string, for the newer Vite-based dev-server', true),
    ('Add the Task model and GET /tasks with pagination and search', 'sequelize-typescript model plus page/pageSize/search query params', true),
    ('Add status filter to GET /tasks', 'status=completed|incomplete, composable with search', true),
    ('Build the task list UI', 'Search, pagination, and bulk selection against the paginated endpoint', true),
    ('Fix FontAwesome icons rendering as garbled boxes', 'Wrong icon class syntax (FontAwesome 5, not 6) plus missing webfont build assets', true),
    ('Add POST /tasks with validation', 'Required non-empty title, optional description', true),
    ('Wire the Add Task dialog to POST /tasks', 'Confirmation/edit dialog service reused for both add and edit', true),
    ('Add PATCH /tasks/:id for partial updates', 'title, description, and completed can be updated independently', true),
    ('Wire task editing to PATCH', 'Includes a shimmer loading state and toast notifications', true),
    ('Add PATCH /tasks/bulk for bulk status updates', 'Mark multiple selected tasks complete or incomplete in one request', true),
    ('Wire the single-task complete/incomplete toggle to PATCH', 'Missed on the first pass - the icon button called nothing until this was caught and fixed', true),
    ('Add DELETE /tasks/:id', 'Validates id, 404 on missing task, 204 on success', true),
    ('Wire single-task delete; remove bulk delete', 'Bulk delete was built, then intentionally removed to keep the UI scope tight', true),
    ('Fix a subscription that never tore itself down', 'fetchTrigger$ is a Subject that never completes; takeUntilDestroyed fixes it', true),
    ('Fix a redundant refetch that undid its own in-place update', 'A bulk-update success handler refetched the whole list right after replacing rows in place', true),
    ('Remove the ngx-translate/i18n scaffolding', 'This app does not need multi-language support', true),
    ('Rename the app from the boilerplate default to tasks.io', 'Updated package.json, angular.json, index.html, and the navbar', true),
    ('Remove the two inner boilerplate READMEs', 'Superseded by the root README, which documents the whole stack', true),
    ('Move sample task seeding into the postgres init script', 'Runs once on a fresh volume; can never wipe data added during a session', true),
    ('Fix CRLF line endings breaking the postgres init scripts', 'Windows checkout converted the shebang line; added .gitattributes to force LF on *.sh', true),
    ('Write the backend test suite', '30 tests across GET/POST/PATCH/PATCH bulk/DELETE, which caught a real pagination bug along the way', true),
    ('Write frontend tests', 'Angular component/service tests are still outstanding', false);
EOSQL
