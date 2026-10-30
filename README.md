# DevOps Lab – Docker practice projects

Small applications for practising **Dockerfile** and **Docker Compose** writing. In every project the application code is
ready; **you write the missing Docker files** and then check your work with the table in the project's `README.md`.

## Requirements

- Docker Engine or Docker Desktop with the Compose plugin (`docker --version`, `docker compose version`)
- `curl` (on Windows 10/11 it is included in PowerShell and `cmd` as `curl.exe`)
- You do **not** need Python, Node.js or Go on your computer. The containers bring them.

## Projects

### Dockerfile (you write `Dockerfile` and `.dockerignore`)

| # | Project | Language | Main topics |
| --- | --- | --- | --- |
| 01 | [`dockerfile/01-flask-hello`](dockerfile/01-flask-hello) | Python | basic instructions, non-root user, exec form |
| 02 | [`dockerfile/02-node-express-api`](dockerfile/02-node-express-api) | Node.js | layer cache, `npm ci`, `ARG`/`ENV`, `HEALTHCHECK`, `.dockerignore` |
| 03 | [`dockerfile/03-ts-multistage`](dockerfile/03-ts-multistage) | TypeScript | multi-stage build, `COPY --from`, `--target` |
| 04 | [`dockerfile/04-go-service`](dockerfile/04-go-service) | Go | static binary, `scratch`, build args, self-checking healthcheck |

### Docker Compose (a working Dockerfile is provided; you write `compose.yaml`)

| # | Project | Services | Main topics |
| --- | --- | --- | --- |
| 05 | [`compose/05-visit-counter`](compose/05-visit-counter) | Flask + Redis | `ports`, `environment`, `depends_on`, named volume, healthcheck |
| 06 | [`compose/06-todo-postgres`](compose/06-todo-postgres) | Flask + PostgreSQL | `.env` interpolation, init script, `service_healthy`, profiles, override file |
| 07 | [`compose/07-three-tier`](compose/07-three-tier) | nginx + Node.js + PostgreSQL | two networks, `internal` network, secrets, resource limits |

## How to work

1. Read the project's `README.md` from top to bottom.
2. Write your files. Use the lecture slides and `docker <command> --help`; do not look for the finished Dockerfile online.
3. Build, run, and go through the **Check yourself** table. Every row must pass.
4. Clean up: `docker compose down -v` for Compose projects, `docker rm -f <name>` for single containers.

Suggested order: 01 → 02 → 05 → 03 → 04 → 06 → 07.
