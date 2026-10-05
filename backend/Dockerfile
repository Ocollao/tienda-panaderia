FROM python:3.12-slim

WORKDIR /app

# Dependencias del sistema para psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Uploads persistentes (en compose van a un volumen)
RUN mkdir -p uploads && chmod +x entrypoint.sh

ENV PORT=5000
ENV SKIP_INIT=1
EXPOSE 5000

# Inicializa la DB una sola vez y luego inicia gunicorn (2 workers)
CMD ["./entrypoint.sh"]
