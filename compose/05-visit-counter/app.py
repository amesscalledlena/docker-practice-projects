"""Visit counter: a Flask web app that keeps its counter in Redis."""
import os
import socket

import redis
from flask import Flask, jsonify

app = Flask(__name__)

# There is no useful default for the host: inside Docker it is the *service name*
# of the Redis container, so you must configure it in your compose file.
REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
PORT = int(os.environ.get("PORT", "8000"))

cache = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, socket_connect_timeout=2, decode_responses=True)


@app.route("/")
def index():
    visits = cache.incr("visits")
    return jsonify(visits=visits, served_by=socket.gethostname(), redis=f"{REDIS_HOST}:{REDIS_PORT}")


@app.route("/reset", methods=["POST"])
def reset():
    cache.set("visits", 0)
    return jsonify(visits=0)


@app.route("/health")
def health():
    try:
        cache.ping()
    except redis.exceptions.RedisError as exc:
        return jsonify(status="unhealthy", error=str(exc)), 503
    return jsonify(status="ok")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
