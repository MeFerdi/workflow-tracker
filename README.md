# Snow Application Tracker

Snow is a simple application tracking system for managing company filing requests from draft creation through review and final decision.

The project was built as a full-stack exercise with a Django API and a React frontend. It focuses on a clean reviewer workflow, clear application status changes, and professional form handling.

## What It Does

- Create draft applications with applicant, company, application type, and description details.
- Edit applications while they are still in `Draft` or `Need More Info`.
- Submit applications for review.
- Move submitted applications into review.
- Approve, reject, or request more information.
- Track important dates such as creation, submission, and review time.

## Tech Stack

- Backend: Django 6, Django Ninja, SQLite
- Frontend: React, TypeScript, Vite
- Styling: Plain CSS with shared UI tokens
- Dev tooling: Docker Compose

## Main URLs

When running with Docker:

- Frontend: `http://localhost:5173`
- API base: `http://localhost:8000/api`
- Django admin: `http://localhost:8000/admin`

## Run With Docker

This is the easiest way for a reviewer or recruiter to test the project.

```bash
docker compose up --build
```

Then open:

```text
http://localhost:5173
```

The backend container runs database migrations automatically before starting the Django server.

To stop the app:

```bash
docker compose down
```

To remove the local Docker database volume as well:

```bash
docker compose down -v
```

## Run Without Docker

### Backend

From the project root:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API will run at:

```text
http://localhost:8000/api
```

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

The Vite development server proxies `/api` requests to Django, so the browser does not need to call the backend directly.

## Application Flow

1. Create a new application.
2. Save it as a draft.
3. Open the application detail page.
4. Submit it for review.
5. Start review.
6. Choose a decision:
   - `Approved`
   - `Rejected`
   - `Need More Info`
7. If more information is required, the application can be edited and resubmitted.

## API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/applications` | List all applications |
| `POST` | `/api/applications` | Create a draft application |
| `GET` | `/api/applications/{id}` | Get one application |
| `PATCH` | `/api/applications/{id}` | Edit an allowed draft application |
| `POST` | `/api/applications/{id}/submit` | Submit an application |
| `POST` | `/api/applications/{id}/review` | Start review |
| `POST` | `/api/applications/{id}/decision` | Record reviewer decision |

## Project Structure

```text
.
├── docker-compose.yml
├── Dockerfile
├── manage.py
├── requirements.txt
├── snow/
│   ├── settings.py
│   └── urls.py
├── tracker/
│   ├── api.py
│   ├── models.py
│   └── schemas.py
└── frontend/
    ├── Dockerfile
    ├── src/
    │   ├── api/
    │   ├── pages/
    │   └── types/
    └── vite.config.ts
```

## Notes For Reviewers

- The backend uses SQLite to keep setup simple.
- Docker Compose stores the SQLite database in a named Docker volume.
- The frontend uses accessible form patterns: visible labels, inline validation, focus handling, loading states, and clear error messages.
- CORS is configured for local development, and Vite proxies API calls during frontend development.

## Useful Commands

Run Django checks:

```bash
python manage.py check
```

Run frontend type checks:

```bash
cd frontend
npx tsc -b
```

Run frontend linting:

```bash
cd frontend
npx eslint . --format json
```

## Author
- Ferdynand Odhiambo
Email: oferdinanddev112@gmail.com
