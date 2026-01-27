# Admin Panel (standalone)

This is a minimal, standalone admin panel to manage users and revoke JWTs for the `digital-farm-platform` project.

Key points
- Separate service from the main app. It connects directly to the same database (via `DATABASE_URL`).
- Admin endpoints are protected using an `ADMIN_TOKEN` header (`X-Admin-Token`).
- Token revocation inserts a record into the `revoked_tokens` table used by the main API.

How to run (local / development)

1. Copy environment variables (the admin app needs at least):

   - DATABASE_URL (example: `postgresql://postgres:postgres@db:5432/digital_farm`)
   - ADMIN_TOKEN (pick a strong secret)
   - SECRET_KEY (must match main app if you want to decode tokens)

2. Run directly (requires Python and dependencies):

```
pip install -r Admin_panel/backend/requirements.txt
cd Admin_panel/backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

3. Open the UI at `http://localhost:8000/static/index.html` and provide the `ADMIN_TOKEN` value.

Docker / compose

- A `docker-compose.admin.yml` file next to this README can be used to spin up only the admin service. You must provide a `DATABASE_URL` that points to your database and set an `ADMIN_TOKEN`.

Security notes
- This scaffold uses a simple static token header for authentication. For production, restrict access with network rules, TLS, and stronger auth (e.g., a small OAuth client or IP allowlist).
