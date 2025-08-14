FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create a non-root user
RUN useradd -m -u 1000 sneakersniper
RUN chown -R sneakersniper:sneakersniper /app
USER sneakersniper

CMD ["celery", "-A", "tasks", "worker", "--loglevel=info"]