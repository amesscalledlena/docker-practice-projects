# 01 – Flask hello: your first Dockerfile

**Level:** beginner · **Time:** ~20 minutes · **Topics:** `FROM`, `WORKDIR`, `COPY`, `RUN`, `ENV`, `EXPOSE`, `USER`, `CMD`

## The application

A tiny Flask web service (`app.py`). It listens on port `5000` (change it with the `PORT`
variable) and has two routes:

| Route | Response |
| --- | --- |
| `GET /` | JSON with a greeting, the environment name, the container hostname and the `uid` it runs as |
| `GET /health` | `{"status": "ok"}` |

Dependencies are listed in `requirements.txt`.

## Your task

Create a file named exactly `Dockerfile` (no extension) in this folder. It must:

1. Start from the base image `python:3.12-slim`.
2. Use `/app` as the working directory.
3. Copy `requirements.txt` **first** and install the dependencies **before** copying the rest of the code. Do not keep pip's download cache in the image.
4. Copy the application code.
5. Set the environment variables `APP_ENV=production` and `PYTHONUNBUFFERED=1`.
6. Document that the container listens on port `5000`.
7. Create a non-root user named `app` (UID `10001`) and run the application as that user.
8. Start the app with `python app.py`, written in **exec form**.

Then create a `.dockerignore` that keeps `__pycache__/`, `.venv/`, `.git` and `*.md` out of the build context.

## Build and run

```bash
docker build -t flask-hello:1.0 .
docker run -d --name hello -p 8080:5000 flask-hello:1.0
curl http://localhost:8080/
```

## Check yourself

| Check | How | Expected |
| --- | --- | --- |
| The service answers | `curl http://localhost:8080/` | JSON containing `"environment":"production"` |
| It does not run as root | look at `uid` in the JSON, or `docker exec hello id` | `uid` is `10001`, not `0` |
| The health route works | `curl http://localhost:8080/health` | `{"status":"ok"}` |
| The cache works | change a word in `app.py`, rebuild | the `pip install` step shows `CACHED` |
| The cache is used correctly | change `requirements.txt`, rebuild | `pip install` runs again |
| Port override works | `docker run --rm -p 9090:9090 -e PORT=9090 flask-hello:1.0` | answers on `localhost:9090` |
| Image is reasonably small | `docker image ls flask-hello` | well under 250 MB |

Clean up with `docker rm -f hello`.

## Stretch goals

- Run `docker history flask-hello:1.0` and find which layer is the largest.
- Change the greeting without rebuilding: `docker run -e GREETING="Merhaba" ...`.
- Tag the same image as `flask-hello:latest` with `docker tag`.
- Explain in one sentence why the app must listen on `0.0.0.0` and not `127.0.0.1`.
