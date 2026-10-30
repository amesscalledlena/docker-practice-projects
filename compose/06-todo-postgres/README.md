# 06 – To-do API with PostgreSQL

**Level:** intermediate · **Time:** ~45 minutes · **Topics:** `.env` and interpolation, named volumes, bind mounts, `healthcheck`, `depends_on: condition`, networks and service discovery, `profiles`, override files

## The application

A Flask REST API (`app/app.py`) that stores to-do items in **PostgreSQL**. A working
`app/Dockerfile` is provided; **you write `compose.yaml`** (and a `.env`).

| Route | Response |
| --- | --- |
| `GET /todos` | list of items |
| `POST /todos` | add an item, body `{"title": "..."}` |
| `DELETE /todos/<id>` | delete an item |
| `GET /health` | `ok` if the database answers, `503` otherwise |

The API is configured only by environment variables: `DB_HOST`, `DB_PORT` (default `5432`), `DB_NAME`, `DB_USER`,
`DB_PASSWORD`, and `PORT` (default `5000`). It does **not** create tables: the file `db/init.sql` does, and PostgreSQL
runs every `*.sql` file it finds in `/docker-entrypoint-initdb.d/` the first time it starts with an empty data directory.

## Your task

**1. Environment file.** Copy `.env.example` to `.env` and set a password. `.env` is already in `.gitignore`.

**2. `compose.yaml`** with two services:

**`db`**

- Image `postgres:16-alpine`.
- Environment `POSTGRES_DB`, `POSTGRES_USER` and `POSTGRES_PASSWORD`, taken from `.env` by **interpolation**
  (`${DB_NAME}` and so on). The compose file must **refuse to run** when `DB_PASSWORD` is missing (`${VAR:?message}`).
- Data directory `/var/lib/postgresql/data` in a **named volume** `pgdata`.
- `./db/init.sql` mounted **read-only** into `/docker-entrypoint-initdb.d/init.sql`.
- A healthcheck with `pg_isready` for the configured user and database (interval 5 s, timeout 3 s, 5 retries,
  start period 10 s). Hint: inside the container the variables already exist, so escape the dollar sign: `$${POSTGRES_USER}`.
- No published ports.

**`web`**

- Built from `./app`; published on host port `5000`.
- `DB_HOST` is the service name of the database; `DB_NAME`, `DB_USER` and `DB_PASSWORD` come from `.env` too.
- Starts only when `db` is **healthy**.
- `restart: unless-stopped`.

## Run it

```bash
docker compose up -d --build
docker compose ps
curl http://localhost:5000/todos
curl -X POST -H "Content-Type: application/json" -d '{"title":"learn compose"}' http://localhost:5000/todos
```

## Check yourself

| Check | How | Expected |
| --- | --- | --- |
| Missing password is refused | remove `DB_PASSWORD` from `.env`, run `docker compose config` | an error that mentions the password |
| Variables are resolved | `docker compose config` | no `${...}` left in the output |
| DB becomes healthy | `docker compose ps` | `db` is `(healthy)`, then `web` starts |
| API works | `curl localhost:5000/todos` | the two seeded items |
| Init script ran | same call | items "Read the Docker Compose slides" and "Write my first compose file" are there |
| Data persists | add an item, `docker compose down`, `up -d` | the new item is still there |
| `down -v` resets | `docker compose down -v`, `up -d` | only the two seeded items |
| DB is private | `docker compose ps` | `db` has no host port; `psql` from the host cannot connect |
| Service-name DNS | `docker compose exec web python -c "import socket; print(socket.gethostbyname('db'))"` | an IP address |

## Bonus tasks

1. **Profile.** Add an `adminer` service (image `adminer:4`, port `8080`) with `profiles: [debug]`. It must start only with
   `docker compose --profile debug up -d`.
2. **Override file.** Write `compose.override.yaml` for development: bind-mount `./app/app.py` over `/app/app.py` in `web`
   and set `FLASK_DEBUG=1`. Docker Compose merges the file automatically. Prove it with `docker compose config`.
3. **Limits.** Limit the `db` service to 512 MB of memory.
4. **Experiment.** Start the stack with `depends_on` as a short list (`- db`) instead of `condition: service_healthy`, using
   `docker compose down -v && docker compose up`. What happens to `web` while the database initializes? Why?
