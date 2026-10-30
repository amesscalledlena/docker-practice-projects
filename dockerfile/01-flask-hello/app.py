"""A tiny Flask web service used for the first Dockerfile exercise."""
import os
import socket

from flask import Flask, jsonify

app = Flask(__name__)

GREETING = os.environ.get("GREETING", "Hello from Docker!")
APP_ENV = os.environ.get("APP_ENV", "development")
PORT = int(os.environ.get("PORT", "5000"))


@app.route("/")
def index():
    # "uid" lets you check from outside which user the container runs as.
    return jsonify(
        message=GREETING,
        environment=APP_ENV,
        hostname=socket.gethostname(),
        uid=os.getuid(),
    )


@app.route("/health")
def health():
    return jsonify(status="ok")


if __name__ == "__main__":
    # 0.0.0.0 is required: 127.0.0.1 inside a container is unreachable from the host.
    app.run(host="0.0.0.0", port=PORT)
