# Dockerfile exercises

Four small applications. Each one needs a `Dockerfile` (and sometimes a `.dockerignore`) that **you** write.

| # | Project | Language | Main topics |
| --- | --- | --- | --- |
| 01 | [`01-flask-hello`](01-flask-hello) | Python | basic instructions, non-root user, exec form |
| 02 | [`02-node-express-api`](02-node-express-api) | Node.js | layer cache, `npm ci`, `ARG`/`ENV`, `HEALTHCHECK`, `.dockerignore` |
| 03 | [`03-ts-multistage`](03-ts-multistage) | TypeScript | multi-stage build, `COPY --from`, `--target` |
| 04 | [`04-go-service`](04-go-service) | Go | static binary, `scratch`, build args, self-checking healthcheck |

Each folder has its own `README.md` with the requirements, the commands to build and run, and a checklist to verify your work.
