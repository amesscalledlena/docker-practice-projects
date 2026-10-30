-- Runs once, the first time the PostgreSQL data directory is created.
-- Mount this file into /docker-entrypoint-initdb.d/ of the postgres container.
CREATE TABLE IF NOT EXISTS todos (
    id    SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    done  BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO todos (title) VALUES
    ('Read the Docker Compose slides'),
    ('Write my first compose file');
