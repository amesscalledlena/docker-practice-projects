# 05 – Visit counter: your first compose file

**Level:** beginner · **Time:** ~30 minutes · **Topics:** `services`, `build`, `image`, `ports`, `environment`, `depends_on`, `volumes`, `healthcheck`, `restart`

## The application

A Flask web app (`app.py`) that counts visits and stores the counter in **Redis**.
A working `Dockerfile` for the web app is already provided; **you write `compose.yaml`**.

| Route | Response |
| --- | --- |
| `GET /` | increments the counter and returns `{"visits": N, ...}` |
| `POST /reset` | sets the counter back to 0 |
| `GET /health` | `ok` if Redis answers, otherwise `503` |

The app reads these environment variables:

| Variable | Meaning | Default |
| --- | --- | --- |
| `REDIS_HOST` | host name of the Redis server | `localhost` (wrong inside Docker!) |
| `REDIS_PORT` | Redis port | `6379` |
| `PORT` | port the web app listens on | `8000` |

## Your task

Create `compose.yaml` with two services.

**`web`**

1. Built from the Dockerfile in this folder.
2. Published on host port `8000` (container port `8000`).
3. `REDIS_HOST` set to the **service name** of the Redis service.
4. Starts only after `redis` is **healthy** (not just started).
5. Restarts automatically unless you stopped it manually.

**`redis`**

6. Image `redis:7-alpine` (pinned tag, not `latest`).
7. Started with the command `redis-server --appendonly yes` so data is written to disk.
8. Data directory `/data` stored in a **named volume** `redisdata`.
9. A healthcheck that runs `redis-cli ping` every 5 seconds (timeout 3 s, 5 retries).
10. **No published ports.** Only the web app should talk to Redis.

## Run it

```bash
docker compose up -d --build
docker compose ps
curl http://localhost:8000/
```

## Check yourself

| Check | How | Expected |
| --- | --- | --- |
| File is valid | `docker compose config` | prints the resolved file without errors |
| Both services run | `docker compose ps` | `web` running, `redis` running **(healthy)** |
| Counter counts | `curl localhost:8000/` three times | `visits` 1, 2, 3 |
| Service-name DNS | `curl localhost:8000/health` | `{"status":"ok"}` (so `REDIS_HOST` is right) |
| Redis is private | `docker compose ps` | no host port for `redis` |
| Data survives `down` | `docker compose down`, then `up -d`, then `curl localhost:8000/` | the counter continues (4, 5, ...) |
| `down -v` resets | `docker compose down -v`, then `up -d` and `curl` | the counter starts again at 1 |
| Volume exists | `docker volume ls` | a volume ending in `redisdata` |
| Auto restart | `docker kill <web container>` (see `docker compose ps`) | the web container comes back |

## Stretch goals

- Add a healthcheck to `web` that calls `/health` (the image has Python, not `curl`; use `python -c` with `urllib`).
- Set a project name with `name:` and look at how it prefixes container, network and volume names.
- Limit memory for Redis to `128M` with `deploy.resources.limits`.
- Run `docker compose exec redis redis-cli get visits` and compare it with the HTTP response.
- Why does `docker compose up -d --scale web=3` fail with your file? What would you change?
