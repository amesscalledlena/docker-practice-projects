# 04 – Go service: tiny image from `scratch`

**Level:** intermediate/advanced · **Time:** ~40 minutes · **Topics:** multi-stage builds, static binaries, `scratch`, `ARG` + `-ldflags`, healthcheck without a shell, numeric `USER`

## The application

A small Go web service (`main.go`, no external dependencies). It listens on port `8080` (override with `PORT`).

| Route | Response |
| --- | --- |
| `GET /` | service name, `version`, Go version, hostname, `uid` |
| `GET /health` | `{"status": "ok"}` |

Two details that matter for the Dockerfile:

- The version is a Go variable set **at build time**: `go build -ldflags "-X main.version=1.0.0"`.
- Running `./app -healthcheck` calls `/health` on the local service and exits `0` (healthy) or `1` (unhealthy). A `scratch`
  image contains no `curl`, no `wget` and no shell, so the binary checks itself.

## Your task

Write a multi-stage `Dockerfile` and a `.dockerignore`.

**Stage 1: `build`**

1. Base image `golang:1.23`, named `build`. Working directory `/src`.
2. Declare `ARG VERSION=dev`.
3. Copy `go.mod` first and run `go mod download`, then copy the rest of the source. (This project has no dependencies, but
   this is the pattern for real ones.)
4. Build a **static** binary named `/app`: `CGO_ENABLED=0`, flags `-trimpath` and `-ldflags "-s -w -X main.version=${VERSION}"`.

**Stage 2: final image**

5. Base image `scratch`.
6. Copy the binary from the `build` stage to `/app`.
7. Run as the numeric user `65532:65532` (there is no `/etc/passwd` in `scratch`, so a name will not work).
8. Document port `8080`.
9. Add `HEALTHCHECK` that runs `/app -healthcheck` every 10 seconds.
10. Use `ENTRYPOINT ["/app"]` (exec form).

`.dockerignore`: exclude `.git`, `*.md`, `app` and `hello-go`.

## Build and run

```bash
docker build --build-arg VERSION=1.0.0 -t hello-go:1.0.0 .
docker run -d --name go -p 8080:8080 hello-go:1.0.0
curl http://localhost:8080/
```

## Check yourself

| Check | How | Expected |
| --- | --- | --- |
| Version is baked in | `curl localhost:8080/` | `"version":"1.0.0"` |
| Not root | `uid` in the JSON | `65532` |
| Tiny image | `docker image ls hello-go` | under 15 MB (compare with `golang:1.23`, about 800 MB) |
| No shell inside | `docker exec -it go sh` | fails: no such file |
| Healthy | wait ~15 s, `docker inspect --format '{{.State.Health.Status}}' go` | `healthy` |
| Fast stop | `time docker stop go` | about a second; the program handles `SIGTERM` |
| Override the port | `docker run --rm -p 9090:9090 -e PORT=9090 hello-go:1.0.0` | answers on `localhost:9090` |

## Stretch goals

- Replace `scratch` with `gcr.io/distroless/static-debian12:nonroot` and compare size and behaviour.
- Build a single-stage image on `golang:1.23` and note the size difference.
- Find out how `docker cp go:/app ./app-copy` helps when a container has no shell.
