# SNPD

SNPD is a full-stack application designed for sneaker enthusiasts. It provides a platform for users to get information on upcoming sneaker releases, and share their thoughts and opinions on them.

## Tech Stack

*   **Backend**: Python, FastAPI, SQLAlchemy, Alembic, Celery
*   **Frontend**: TypeScript, Next.js, React
*   **Database**: PostgreSQL
*   **Cache**: Redis
*   **Infrastructure**: Docker, Docker Compose, Prometheus, Grafana

## Services

*   **`backend`**: A FastAPI application that serves as the main API for the platform.
*   **`worker`**: A Celery worker that handles asynchronous tasks.
*   **`frontend`**: A Next.js application that provides the user interface.
*   **`postgres`**: A PostgreSQL database that stores all the data for the platform.
*   **`redis`**: A Redis cache that is used for caching and as a message broker for Celery.
*   **`prometheus`**: A Prometheus server that collects metrics from the platform.
*   **`grafana`**: A Grafana server that provides a dashboard for visualizing the metrics collected by Prometheus.

## Prerequisites

*   Docker
*   Docker Compose

## Quickstart

1.  Clone the repository:

    ```bash
    git clone https://github.com/myspacecornelius/SNPD.git
    cd SNPD
    ```

2.  Create a `.env` file from the `.env.example` file and fill in the required environment variables:

    ```bash
    cp .env.example .env
    ```

3.  Build and start the services:

    ```bash
    docker-compose up --build -d
    ```

4.  Check the status of the services:

    ```bash
    docker-compose ps
    ```

5.  Tail the logs of the services:

    ```bash
    docker-compose logs -f backend frontend worker
    ```

6.  Stop the services:

    ```bash
    docker-compose stop
    ```

7.  Stop and remove the services:

    ```bash
    docker-compose down
    ```

## Local Development

### Frontend

1.  Navigate to the `frontend` directory:

    ```bash
    cd frontend
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

3.  Start the development server:

    ```bash
    npm run dev
    ```

The frontend will be available at `http://localhost:3000`.

### Backend

1.  Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2.  Create a virtual environment:

    ```bash
    python -m venv venv
    ```

3.  Activate the virtual environment:

    ```bash
    source venv/bin/activate
    ```

4.  Install the dependencies:

    ```bash
    pip install -r requirements.txt
    ```

5.  Start the development server:

    ```bash
    uvicorn main:app --reload
    ```

The backend will be available at `http://localhost:8000`.

## Database

### Migrations

To run database migrations, run the following command:

```bash
docker-compose exec backend alembic upgrade head
```

### Seeding

To seed the database with sample data, run the following command:

```bash
docker-compose exec backend python seed.py
```

## Testing

To run the tests, run the following command:

```bash
docker-compose exec backend pytest
```

## Linting

To lint the code, run the following command:

```bash
docker-compose exec backend flake8
```

## Troubleshooting

*   **Port in use**: If you get an error that a port is already in use, you can find the process that is using the port with the following command:

    ```bash
    lsof -i :<port>
    ```

*   **Stale containers**: If you are having issues with stale containers, you can restart a service with the following command:

    ```bash
    docker-compose restart <service>
    ```

