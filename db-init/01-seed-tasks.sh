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
    ('Fix stale gitlink entries', 'Turns out backend and frontend werent submodules, just a confused git index', true),
    ('Discover npm install needs --ignore-scripts', 'Windows + native postinstall scripts do not mix; also just good supply-chain hygiene', true),
    ('Figure out why nodemon would not reload', 'Docker Desktop on Windows does not forward file events through the bind mount, needed legacyWatch polling', true),
    ('Figure out why Angular would not reload either', 'Same problem, different app - needed --poll=1000 on ng serve', true),
    ('Fix the proxy that proxied nothing', 'context needed to be an array, not a string, per the new Vite-based dev-server', true),
    ('Investigate why the icons looked like tofu', 'FontAwesome 5, not 6 - fa-solid was never a class, needed fas + the actual webfont assets copied into the build', true),
    ('Explain what [Op.or] is doing', 'It is just an object with a Symbol key, nothing scary', true),
    ('Explain TaskStatusFilter shenanigans', 'Show Completed means show everything, not completed-only - naming is hard', true),
    ('Build the dialog service', 'One modal component, two purposes: Add Task and Edit Task, thanks to an @Input() dialogTitle', true),
    ('Chase down why bulk actions never showed a shimmer', 'Local network is too fast for its own good; added a minimum-visible-duration instead of faking latency', true),
    ('Get yelled at for calling title.trim() twice', 'Fair. Trimmed once, reused the value.', true),
    ('Get yelled at for not surfacing backend errors', 'Also fair. err.error.message now makes it to the toast.', true),
    ('Reintroduce and then remove bulk delete', 'Built it, user said no thanks, deleted it - respect the scope', true),
    ('Fix the redundant refetch that undid its own in-place update', 'The comment said one thing, the very next line did the opposite', true),
    ('Learn that splicing rows leaves a half-empty page', 'Only refetch when a row would actually disappear from the current filter', true),
    ('Center a toast at the bottom of the screen', 'bottom-0 start-50 translate-middle-x, easy once you know the classes', true),
    ('Disable modal backdrop click and center dialogs', 'backdrop: static, centered: true, shared across every dialog via one options object', true),
    ('Confirm actionInProgress can never get stuck true', 'Every path that sets it true has a corresponding clear - verified, not just assumed', true),
    ('Evict ngx-translate and its language selector', 'This app has one language: sarcasm', true),
    ('Notice environment.prod.ts still pointed at chucknorris.io', 'A boilerplate leftover nobody asked for', true),
    ('Rename the app from "challenge" to tasks.io', 'It deserved a real name', true),
    ('Delete two inner READMEs nobody was going to read', 'The root README covers the whole stack now', true),
    ('Find the one subscription that does not tear itself down', 'fetchTrigger$ never completes on its own - takeUntilDestroyed fixed it', true),
    ('Discover CRLF broke the postgres init scripts', '/bin/bash^M: bad interpreter - Windows line endings strike again', true),
    ('Add a .gitattributes so that never happens again', 'text eol=lf for *.sh, going forward', true),
    ('Move task seeding into the postgres entrypoint', 'Runs once, on a truly empty volume, never wipes real data on restart', true);
EOSQL
