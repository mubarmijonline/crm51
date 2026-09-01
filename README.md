# crm51

Revamp branch of the 51 American CRM. Flask app behind nginx, MySQL backend.

Cloned from the production `51_american_crm_nginx` project as a development
copy, pointed at its own database so production data is never touched.

## Layout

| Path | Purpose |
|---|---|
| `american_crm.py` | Application: routes, views, business logic |
| `dbconnection.py` | MySQL connection factory, reads credentials from the environment |
| `wsgi.py` | WSGI entry point (`wsgi:app`) |
| `templates/` | Jinja templates |
| `static/` | CSS, JS, images, vendor assets |
| `deploy/` | nginx site config, systemd unit, gunicorn config |

## Setup

```bash
python3 -m venv 51_american_crm_venv
./51_american_crm_venv/bin/pip install -r reqs.txt gunicorn
cp .env.example .env    # then fill in the values
```

`.env` holds the database credentials and the Flask `SECRET_KEY`. It is
git-ignored and must stay that way. Generate a fresh key per environment:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

## Running

Development:

```bash
./51_american_crm_venv/bin/python american_crm.py
```

Production is gunicorn under systemd, proxied by nginx over HTTPS. The unit and
site config in `deploy/` are rendered for a specific host and port pair.

## Excluded from this repository

Uploaded lead documents (`static/event_upload_files/`) and generated CRM
spreadsheets (`static/crm_excel_files/`) contain real personal data and are
git-ignored. The virtualenv and application logs are excluded too.

## Known issues

Passwords in the `user` table are stored and compared in plaintext
(`american_crm.py`, login handler). Replacing this with hashed passwords is
outstanding work for the revamp.
