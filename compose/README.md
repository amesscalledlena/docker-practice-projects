# Docker Compose exercises

Three multi-container applications. The application code and a working `Dockerfile` for each service are provided.
**You write the `compose.yaml`** (and the `.env` or secret files it needs).

| # | Project | Services | Main topics |
| --- | --- | --- | --- |
| 05 | [`05-visit-counter`](05-visit-counter) | Flask + Redis | `ports`, `environment`, `depends_on`, named volume, healthcheck, restart |
| 06 | [`06-todo-postgres`](06-todo-postgres) | Flask + PostgreSQL | `.env` interpolation, init script bind mount, `service_healthy`, profiles, override file |
| 07 | [`07-three-tier`](07-three-tier) | nginx + Node.js + PostgreSQL | two networks, `internal` network, secrets, read-only mounts, resource limits |

Each folder has its own `README.md` with the requirements and a table to verify your work.

Useful commands:

```bash
docker compose config            # validate and print the resolved file
docker compose up -d --build     # build and start in the background
docker compose ps                # state and health
docker compose logs -f web       # follow logs of one service
docker compose down              # stop and remove containers and networks (keeps volumes)
docker compose down -v           # ... and delete the named volumes too
```
