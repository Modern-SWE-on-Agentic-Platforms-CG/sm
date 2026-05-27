# Quickstart: SmartHire Backend

**Prerequisites**: Docker Desktop, Python 3.11+, Git

---

## 1. Clone and enter the repository

```bash
git clone <repo-url> smarthire-backend
cd smarthire-backend
```

---

## 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with real values (see variable reference below)
```

**Required variables** (`.env`):

```dotenv
# Database
DATABASE_URL=postgresql+asyncpg://smarthire:smarthire@localhost:5432/smarthiredb001
SMARTHIRE_DB_SCHEMA=smarthire

# JWT
JWT_SECRET=<change-me-in-production>
JWT_ALGORITHM=HS256

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=smarthire
KEYCLOAK_CLIENT_ID=smarthire-backend
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=<keycloak-admin-password>
KEYCLOAK_VERIFY_SSL=true

# AWS
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
S3_BUCKET_NAME=smarthire-dev
S3_FEEDBACK_BUCKET=smarthireprod
SES_FROM_ADDRESS=noreply@smarthire.internal

# Microsoft Graph API (Teams)
MS_TENANT_ID=<tenant-id>
MS_CLIENT_ID=<client-id>
MS_CLIENT_SECRET=<client-secret>

# App
APP_PORT=8083
LOG_LEVEL=INFO
```

> **Security**: Never commit `.env` — it is in `.gitignore`. Use `.env.example` with placeholder values only.

---

## 3. Start PostgreSQL with Docker Compose

```bash
docker-compose up -d db
```

This starts PostgreSQL 15 on port 5432, creates the `smarthiredb001` database, and runs
the init SQL that creates the `smarthire` schema.

Verify the database is ready:
```bash
docker-compose exec db psql -U smarthire -d smarthiredb001 -c "\dn"
# Should show: smarthire schema listed
```

---

## 4. Install Python dependencies

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install all dependencies
pip install -e ".[dev]"
```

---

## 5. Run Alembic migrations

```bash
alembic upgrade head
```

Verify:
```bash
alembic current
# Should show: head revision (0001_initial_schema)
```

---

## 6. Start the development server

```bash
uvicorn src.smarthire.main:app --host 0.0.0.0 --port 8083 --reload
```

The API is now available at:
- **API**: http://localhost:8083
- **Interactive docs (Swagger)**: http://localhost:8083/docs
- **OpenAPI JSON**: http://localhost:8083/openapi.json
- **Health check**: http://localhost:8083/health

---

## 7. Run tests

```bash
# All tests with coverage
pytest --cov=src --cov-report=term-missing --cov-fail-under=80

# Unit tests only (no DB needed)
pytest tests/unit/

# Integration tests (requires Docker PostgreSQL running)
SMARTHIRE_TEST_SCHEMA=smarthire_test pytest tests/integration/

# Contract tests
pytest tests/contract/
```

---

## 8. Run linters

```bash
# Ruff (lint + format check)
ruff check src/
ruff format --check src/

# Mypy type check
mypy --strict src/

# Fix auto-fixable issues
ruff check --fix src/
ruff format src/
```

---

## 9. Docker Compose — full stack

To run the application alongside PostgreSQL in a single compose stack:

```bash
docker-compose up --build
```

The app container will apply migrations automatically on startup before binding the port.

---

## 10. Test a protected endpoint

```bash
# Get a JWT from Keycloak (replace with real credentials)
TOKEN=$(curl -s -X POST \
  "http://localhost:8080/realms/smarthire/protocol/openid-connect/token" \
  -d "grant_type=password&client_id=smarthire-backend&username=recruiter@example.com&password=password" \
  | jq -r .access_token)

# Call a protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8083/lookup/skills
```

---

## 11. Test the public prescreen endpoint (no auth)

```bash
curl "http://localhost:8083/prescreen/updatePrescreenDetails?prescreenId=PS001&recruiterEmailId=jane@example.com&recruiterName=Jane+Doe"
# Should return 200 without an Authorization header
```

---

## Useful Commands

| Command | Purpose |
|---------|---------|
| `alembic upgrade head` | Apply all pending migrations |
| `alembic downgrade base` | Roll back all migrations |
| `alembic revision --autogenerate -m "description"` | Generate a new migration from model changes |
| `docker-compose down -v` | Stop containers and remove volumes |
| `pytest -x -v` | Run tests, stop on first failure |
| `ruff check src/ --fix` | Auto-fix lint issues |

---

## Troubleshooting

**`asyncpg.InvalidCatalogNameError`** — The database `smarthiredb001` doesn't exist. Run
`docker-compose up -d db` and wait for it to initialise.

**`sqlalchemy.exc.ProgrammingError: schema "smarthire" does not exist`** — Run
`alembic upgrade head` to create the schema and tables.

**`401 Unauthorized` on every request** — Ensure `JWT_SECRET` in `.env` matches the
secret used when the token was issued by Keycloak.

**APScheduler jobs not firing** — Jobs only run when the full app is started with
`uvicorn`. They do not run during `pytest` (APScheduler is not started in test mode).
