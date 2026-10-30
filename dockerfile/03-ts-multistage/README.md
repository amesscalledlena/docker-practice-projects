# 03 – TypeScript service: multi-stage build

**Level:** intermediate · **Time:** ~40 minutes · **Topics:** multi-stage builds, named stages, `COPY --from`, `--target`, image size, `USER`

## The application

A small TypeScript (Express) service. The sources are in `src/`. They must be **compiled** with
`npm run build` (it runs `tsc` and writes JavaScript to `dist/`) before the server can start with
`node dist/server.js`.

| Route | Response |
| --- | --- |
| `GET /` | service info, Node version, `uid` |
| `GET /quotes` | all quotes |
| `GET /quotes/random` | one random quote |
| `GET /health` | `{"status": "ok"}` |

The service listens on port `3000` (override with `PORT`).

The compiler (`typescript`) and the type packages are **devDependencies**. They are needed to build the app, but
they are useless, and heavy, at run time. That is exactly what a multi-stage build is for.

## Your task

Write a `Dockerfile` with **two stages** and a `.dockerignore`.

**Stage 1: `build`**

1. Base image `node:20-alpine`, named `build` (`FROM ... AS build`).
2. Working directory `/app`.
3. Copy the manifests first and run `npm ci` (all dependencies, including dev).
4. Copy the sources and the TypeScript config, then run `npm run build`.

**Stage 2: runtime (the final image)**

5. Base image `node:20-alpine` again.
6. Working directory `/app`, `NODE_ENV=production`.
7. Copy the manifests and install **production dependencies only** (`npm ci --omit=dev`).
8. Copy only the compiled `dist/` folder **from the `build` stage**.
9. Document port `3000`, run as the built-in `node` user and start with `node dist/server.js` in exec form.

**`.dockerignore`:** exclude `node_modules`, `dist`, `.git`, `*.log`, `.env*` and `*.md`.

## Build and run

```bash
docker build -t quotes:1.0 .
docker run -d --name quotes -p 3000:3000 quotes:1.0
curl http://localhost:3000/quotes/random
```

Build only the first stage (useful for debugging the build):

```bash
docker build --target build -t quotes:build .
```

## Check yourself

| Check | How | Expected |
| --- | --- | --- |
| The service works | `curl localhost:3000/quotes/random` | a random quote as JSON |
| Not root | `uid` from `curl localhost:3000/` | `1000` |
| No compiler in the final image | `docker run --rm quotes:1.0 ls node_modules/.bin` | no `tsc` |
| No TypeScript sources in the final image | `docker run --rm quotes:1.0 ls /app` | `dist`, `node_modules`, `package*.json`, but no `src` |
| The final image is smaller | `docker image ls quotes` | `quotes:1.0` is clearly smaller than `quotes:build` |
| Cache works | edit `src/quotes.ts`, rebuild | `npm ci` steps show `CACHED`, only the build step reruns |

## Stretch goals

- Write a single-stage version of the Dockerfile and compare the sizes with `docker image ls`.
- Add a third stage called `test` between the two others that runs a command which must succeed (for example
  `RUN npx tsc --noEmit`). Build with `--target test`.
- Use `docker history quotes:1.0` to see why deleting files in a later layer would not have made a single-stage image smaller.
