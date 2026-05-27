# ---- builder stage --------------------------------------------------------
FROM python:3.12-slim AS builder

WORKDIR /build

COPY pyproject.toml ./
COPY src/ ./src/

RUN pip install --upgrade pip \
    && pip install --no-cache-dir ".[dev]" \
    && pip install --no-cache-dir .

# ---- runtime stage --------------------------------------------------------
FROM python:3.11-slim AS runtime

# Non-root user
RUN groupadd --gid 1001 smarthire \
    && useradd --uid 1001 --gid smarthire --shell /bin/bash --create-home smarthire

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application source
COPY --chown=smarthire:smarthire src/ ./src/

USER smarthire

EXPOSE 8083

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

ENTRYPOINT ["uvicorn", "smarthire.main:app", "--host", "0.0.0.0", "--port", "8083"]
