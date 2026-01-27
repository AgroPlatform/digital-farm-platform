#!/usr/bin/env bash
set -euo pipefail

echo "Starting container entrypoint - waiting for DB"

python - <<'PY'
import os, time, sys
from urllib.parse import urlparse

dsn = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@db:5432/digital_farm')
print('Using DATABASE_URL=', dsn)

try:
  import psycopg2
  from psycopg2 import sql
except Exception as e:
  print('psycopg2 not available:', e)
  sys.exit(1)

# Parse DSN
u = urlparse(dsn)
db_name = u.path.lstrip('/') or 'digital_farm'
db_user = u.username or 'postgres'
db_password = u.password or ''
db_host = u.hostname or 'db'
db_port = u.port or 5432

print(f'Will ensure database {db_name} and role {db_user} exist on {db_host}:{db_port}')

# Wait until Postgres accepts connections on the default 'postgres' database
for _ in range(60):
  try:
    conn = psycopg2.connect(dbname='postgres', user=db_user, password=db_password, host=db_host, port=db_port)
    conn.autocommit = True
    conn.close()
    print('Postgres superuser connection reachable')
    break
  except Exception as e:
    print('Waiting for Postgres...', e)
    time.sleep(1)
else:
  print('Postgres still unreachable, exiting')
  sys.exit(1)

try:
  conn = psycopg2.connect(dbname='postgres', user=db_user, password=db_password, host=db_host, port=db_port)
  conn.autocommit = True
  cur = conn.cursor()

  # Create role/user if it doesn't exist
  cur.execute(sql.SQL("SELECT 1 FROM pg_roles WHERE rolname=%s"), [db_user])
  if cur.fetchone() is None:
    print(f'Role {db_user} not found, creating')
    # create role with login and password
    cur.execute(sql.SQL("CREATE ROLE {user} WITH LOGIN PASSWORD %s").format(user=sql.Identifier(db_user)), [db_password])
  else:
    print(f'Role {db_user} already exists')

  # Create database if it doesn't exist
  cur.execute(sql.SQL("SELECT 1 FROM pg_database WHERE datname=%s"), [db_name])
  if cur.fetchone() is None:
    print(f'Database {db_name} not found, creating')
    cur.execute(sql.SQL("CREATE DATABASE {dbname} OWNER {owner}").format(dbname=sql.Identifier(db_name), owner=sql.Identifier(db_user)))
  else:
    print(f'Database {db_name} already exists')

  cur.close()
  conn.close()
except Exception as e:
  print('Error ensuring database/role:', e)
  # Continue and let later steps fail if needed
  pass

# Wait until the target database accepts connections
for _ in range(60):
  try:
    conn = psycopg2.connect(dbname=db_name, user=db_user, password=db_password, host=db_host, port=db_port)
    conn.close()
    print(f'Database {db_name} reachable')
    break
  except Exception as e:
    print(f'Waiting for database {db_name}...', e)
    time.sleep(1)
else:
  print(f'Database {db_name} still unreachable, exiting')
  sys.exit(1)

# Ensure users table exists with all required columns (fallback if Alembic didn't create it)
try:
  conn = psycopg2.connect(dbname=db_name, user=db_user, password=db_password, host=db_host, port=db_port)
  conn.autocommit = True
  cur = conn.cursor()
  cur.execute(sql.SQL('''
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      hashed_password VARCHAR(255) NOT NULL,
      full_name VARCHAR(255),
      phone VARCHAR(50),
      job_title VARCHAR(255),
      is_active BOOLEAN NOT NULL DEFAULT true,
      notification_preferences JSON,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  '''))
  cur.close()
  conn.close()
  print('Ensured users table exists with all columns')
except Exception as e:
  print('Error ensuring users table exists:', e)
  # proceed, create_user will handle missing table with error message

PY

echo "Database is up, running migrations (if any) and creating test user"

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  if [ -d "alembic" ]; then
    if command -v alembic >/dev/null 2>&1; then
      echo "RUN_MIGRATIONS is true: running alembic upgrade head"
      alembic upgrade head || true
    else
      echo "alembic not installed in container, skipping migrations"
    fi
  fi
else
  echo "RUN_MIGRATIONS is false — skipping alembic migrations"
fi

# Dev-only automatic table creation for ephemeral DBs. Set DEV_DB_CREATE=false
# to disable this in environments where you prefer to use Alembic migrations.
if [ "${DEV_DB_CREATE:-true}" = "true" ]; then
  python - <<'PY'
try:
  # Import model modules so Base.metadata is populated with all tables
  # (users, fields, revoked_tokens, etc.). Without these imports
  # create_all() may not create tables defined in modules that haven't
  # been imported yet.
  import app.models.user  # noqa: F401
  import app.models.field  # noqa: F401
  import app.db.models  # noqa: F401
  from app.db.session import engine, Base
  print('DEV_DB_CREATE enabled: creating tables from SQLAlchemy models (if missing)')
  Base.metadata.create_all(bind=engine)
  print('Tables created (if they did not exist)')
except Exception as e:
  print('Error creating tables from models:', e)
  # Continue; if this fails the subsequent script may still provide useful
  # diagnostics or the container will fail later.
  pass
PY
else
  echo "DEV_DB_CREATE is false — skipping automatic create_all()"
fi

# Create test user via script (idempotent)
TEST_EMAIL=${TEST_USER_EMAIL:-user@example.com}
TEST_PASSWORD=${TEST_USER_PASSWORD:-Passw0rd}
TEST_FULL=${TEST_USER_FULLNAME:-"Test User"}

echo "Ensuring test user exists: $TEST_EMAIL"
python -m app.scripts.create_user --email "$TEST_EMAIL" --password "$TEST_PASSWORD" --full-name "$TEST_FULL" || true

echo "Entrypoint finished, launching command: $@"

exec "$@"