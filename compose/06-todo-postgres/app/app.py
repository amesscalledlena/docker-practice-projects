"""To-do REST API: Flask + PostgreSQL."""
import os

import psycopg2
import psycopg2.extras
from flask import Flask, jsonify, request

app = Flask(__name__)

PORT = int(os.environ.get("PORT", "5000"))

# Database settings come only from the environment. There are no secrets in the code.
DB_SETTINGS = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", "5432")),
    "dbname": os.environ.get("DB_NAME", "todos"),
    "user": os.environ.get("DB_USER", "todo"),
    "password": os.environ.get("DB_PASSWORD", ""),
    "connect_timeout": 3,
}


def connect():
    return psycopg2.connect(**DB_SETTINGS)


@app.route("/")
def index():
    return jsonify(service="todo-api", endpoints=["GET /todos", "POST /todos", "DELETE /todos/<id>", "GET /health"])


@app.route("/health")
def health():
    try:
        with connect() as conn, conn.cursor() as cur:
            cur.execute("SELECT 1")
    except psycopg2.Error as exc:
        return jsonify(status="unhealthy", error=str(exc).strip()), 503
    return jsonify(status="ok")


@app.route("/todos", methods=["GET"])
def list_todos():
    with connect() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("SELECT id, title, done FROM todos ORDER BY id")
        return jsonify(cur.fetchall())


@app.route("/todos", methods=["POST"])
def add_todo():
    title = (request.get_json(silent=True) or {}).get("title")
    if not title:
        return jsonify(error="title is required"), 400
    with connect() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("INSERT INTO todos (title) VALUES (%s) RETURNING id, title, done", (title,))
        return jsonify(cur.fetchone()), 201


@app.route("/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    with connect() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM todos WHERE id = %s", (todo_id,))
        if cur.rowcount == 0:
            return jsonify(error="not found"), 404
    return "", 204


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
