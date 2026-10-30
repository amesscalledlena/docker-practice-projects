# 07 – Three-tier stack: proxy, API and database

**Level:** advanced · **Time:** ~60 minutes · **Topics:** multiple networks and isolation, `internal` networks, bind mounts (`:ro`), secrets, healthchecks, resource limits, scaling

## The application

```
browser ──:8080──▶ proxy (nginx) ──▶ api (Node.js) ──▶ db (PostgreSQL)
                   └─ frontend network ─┘└──── backend network ────┘
```

| Part | What is provided |
| --- | --- |
| `frontend/index.html` | a static page that lists and adds notes through `/api/notes` |
| `nginx.conf` | serves the static page and forwards `/api/` to the host name `api` on port `3000` |
| `api/` | Express + PostgreSQL REST API **with its Dockerfile** |
| `db/init.sql` | creates and seeds the `notes` table |

The API is configured by environment variables: `DB_HOST`, `DB_PORT` (default `5432`), `DB_NAME`, `DB_USER`, and the
password either as `DB_PASSWORD` or, better, as a **file** whose path is in `DB_PASSWORD_FILE`. Its health route is
`GET /api/health`. The API listens on port `3000`.

## Your task

**1. A secret file.** Create `secrets/db_password.txt` that contains only a password
(`mkdir secrets` first; the folder is in `.gitignore`).

**2. `compose.yaml`** with three services and two networks.

**`proxy`**

- Image `nginx:1.27-alpine`, host port `8080` mapped to container port `80`.
- `./nginx.conf` mounted read-only as `/etc/nginx/conf.d/default.conf`.
- `./frontend` mounted read-only as `/usr/share/nginx/html`.
- Attached to the `frontend` network **only**. Starts after `api`.

**`api`**

- Built from `./api`. No published port.
- Attached to **both** `frontend` and `backend`.
- `DB_HOST` is the db service name; `DB_NAME=notes`, `DB_USER=notes`;
  `DB_PASSWORD_FILE=/run/secrets/db_password`, and the secret `db_password` is given to the service.
- Starts only when `db` is healthy. A healthcheck calls `http://localhost:3000/api/health` with `wget -q --spider` (the Alpine
  image has no `curl`).
- `restart: unless-stopped`. Memory limit `256M`.

**`db`**

- Image `postgres:16-alpine`. `POSTGRES_DB=notes`, `POSTGRES_USER=notes`, and the password read from the
  **secret file** with `POSTGRES_PASSWORD_FILE=/run/secrets/db_password`.
- Named volume `pgdata` for `/var/lib/postgresql/data`; `./db/init.sql` mounted read-only into `/docker-entrypoint-initdb.d/init.sql`.
- Healthcheck with `pg_isready` (interval 5 s, timeout 3 s, 5 retries, start period 10 s).
- Attached to the `backend` network **only**. No published ports.

**Top level**

- Networks `frontend` and `backend`. The `backend` network must be `internal: true`.
- Volume `pgdata`.
- Secret `db_password` loaded from `./secrets/db_password.txt`.

## Run it

```bash
docker compose up -d --build
docker compose ps
```

Open <http://localhost:8080>, add a note, and reload the page.

## Check yourself

| Check | How | Expected |
| --- | --- | --- |
| Valid file | `docker compose config` | no errors |
| Everything is up | `docker compose ps` | `db` and `api` `(healthy)`; `proxy` running |
| Only one published port | `docker compose ps` | only `8080` is published |
| Web page works | open `http://localhost:8080` | seed note is shown; new notes appear after reload |
| API through the proxy | `curl localhost:8080/api/health` | `{"status":"ok"}` |
| The API is not reachable directly | `curl localhost:3000/api/health` | connection refused |
| The proxy cannot see the database | `docker compose exec proxy ping -c 1 db` | `bad address 'db'` |
| The API can see the database | `docker compose exec api ping -c 1 db` | replies |
| Secret is a file, not a variable | `docker compose exec api printenv DB_PASSWORD` prints nothing; `docker compose exec api cat /run/secrets/db_password` prints the password | as described |
| Password not in `docker inspect` | `docker inspect <db container> --format '{{.Config.Env}}'` | no password value |
| Data persists | add a note, `docker compose down`, `up -d` | the note is still there |
| Limits applied | `docker stats --no-stream` | the `api` memory limit is 256 MiB |

## Stretch goals

- Scale the API: `docker compose up -d --scale api=2`. Which parts of your file make this possible? (Think of `container_name` and host ports.)
- Make the proxy filesystem read-only (`read_only: true`) and fix the errors with `tmpfs` mounts for `/var/cache/nginx` and `/var/run`.
- Add a `compose.override.yaml` that publishes the database on `127.0.0.1:5432` for local debugging only.
- Draw the network diagram of your final file and compare it with the picture at the top of this README.
