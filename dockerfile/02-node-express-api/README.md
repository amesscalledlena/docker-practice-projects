# 02 – Express API: cache-friendly Dockerfile

**Level:** beginner/intermediate · **Time:** ~30 minutes · **Topics:** layer cache order, `npm ci`, `.dockerignore`, `ARG`/`ENV`, `HEALTHCHECK`, `USER`, signals

## The application

A small Node.js (Express) REST API in `server.js`. It listens on port `3000` (override with `PORT`).

| Route | Response |
| --- | --- |
| `GET /` | service name, `version` (from the `APP_VERSION` variable), Node version, `NODE_ENV`, and the `uid` it runs as |
| `GET /health` | `{"status": "ok"}` |
| `GET /api/items` | list of items (kept in memory) |
| `POST /api/items` | add an item, body: `{"name": "..."}` |

`package.json` and `package-lock.json` describe the dependencies. `npm test` runs a tiny smoke test.

## Your task

Write a `Dockerfile` and a `.dockerignore`.

**Dockerfile requirements**

1. Base image `node:20-alpine`.
2. Working directory `/app`.
3. Install dependencies with `npm ci --omit=dev`. The manifest files (`package.json`, `package-lock.json`) must be copied **before** the source code so that a code change does not reinstall the dependencies.
4. Declare a build argument `APP_VERSION` (default `dev`) and turn it into an environment variable of the same name, so the running app reports it.
5. Set `NODE_ENV=production`.
6. Add a `LABEL` with the key `org.opencontainers.image.title` and a value of your choice.
7. Document port `3000`.
8. Run as the built-in non-root user `node`. The application files must be readable by that user.
9. Add a `HEALTHCHECK` that calls `http://localhost:3000/health` every 30 seconds with a 3-second timeout. The Alpine image has `wget` but not `curl`.
10. Start the server with `node server.js` in **exec form** (not `npm start`; think about why).

**`.dockerignore` requirements:** exclude `node_modules`, `.git`, `*.log`, `.env*`, `test` and `*.md`.

## Build and run

```bash
docker build --build-arg APP_VERSION=1.2.3 -t items-api:1.2.3 .
docker run -d --name api -p 3000:3000 items-api:1.2.3
curl http://localhost:3000/
```

## Check yourself

| Check | How | Expected |
| --- | --- | --- |
| The build argument arrives | `curl localhost:3000/` | `"version":"1.2.3"` and `"env":"production"` |
| Not root | `uid` in the JSON | `1000` (the `node` user) |
| Items work | `curl -X POST -H "Content-Type: application/json" -d '{"name":"book"}' localhost:3000/api/items` | `201` and the new item |
| Dependency layer is cached | edit a line in `server.js`, rebuild | the `npm ci` step shows `CACHED` |
| Dependency layer is rebuilt | add a space to `package.json`, rebuild | `npm ci` runs again |
| Health check works | wait ~35 s, then `docker ps` | status `(healthy)` |
| Health state | `docker inspect --format '{{.State.Health.Status}}' api` | `healthy` |
| Fast, clean stop | `time docker stop api` | well under 10 seconds, and `docker logs api` shows `received SIGTERM` |
| Context is small | look at the first lines of the build output | the context is a few KB, not hundreds of MB |

## Stretch goals

- Rebuild with `--no-cache` and compare the build time with a cached rebuild.
- Use `docker history items-api:1.2.3` to see which layers come from the base image and which are yours.
- Put the Dockerfile instructions in the "wrong" order (`COPY . .` first) and measure how long a rebuild takes after editing `server.js`.
- Why does `docker stop` take 10 seconds if you start the app with `CMD npm start`? Try it.
