import os
from pathlib import Path

import MySQLdb


def _load_env():
    """Load .env into the environment for manual runs.

    Under systemd the same values arrive via EnvironmentFile, so anything
    already set in the environment wins.
    """
    env_path = Path(__file__).resolve().parent / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_env()


def _required(name):
    try:
        return os.environ[name]
    except KeyError:
        raise RuntimeError(
            "%s is not set. Copy .env.example to .env and fill it in." % name
        )


def connection():
   conn = MySQLdb.connect(host = os.environ.get("DB_HOST", "localhost"),
                          user = _required("DB_USER"),
                          passwd = _required("DB_PASSWORD"),
                          db = _required("DB_NAME"),
                          charset='utf8',
                          init_command='SET NAMES UTF8')
   cur = conn.cursor()
   return conn, cur

conn,cur=connection()

conn.close()
