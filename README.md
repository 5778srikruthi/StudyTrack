# StudyTrack

A web-based student task and study-management application.

## Overview

StudyTrack helps students organise academic tasks and monitor completion progress. Users can register, log in, view a dashboard, and manage tasks. Task data is stored in MySQL through a Java Spring Boot backend, allowing completion status to persist after a page refresh.

## Features

- User registration and login
- Dashboard with task list and progress counters
- Persistent task storage using MySQL
- Mark tasks as completed
- Frontend pages for home, login, registration, dashboard, calendar, and folders

> Confirm the final behaviour of each page/module against the current source code before presenting it as a completed feature.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Java 21, Spring Boot, Maven |
| Database | MySQL |
| Version control | Git, GitHub |
| Frontend hosting | Vercel |
| Backend hosting | Railway |

## Architecture

The browser-based frontend sends HTTP requests to the Spring Boot backend. The backend processes application operations and reads or writes persistent data in MySQL.

## Repository Structure

```text
StudyTrack/
├── frontend/
├── backend/
├── database/
├── docs/
└── README.md
```

The exact files and subfolders may vary with the current repository version.

## Prerequisites

- Java 21
- MySQL Server
- A modern web browser
- Visual Studio Code (recommended)

## Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/5778srikruthi/StudyTrack.git
   ```

2. Create a MySQL database, for example `studytrack`.

3. Configure the backend database connection. Keep credentials in environment variables rather than committing them:

   - `DB_USERNAME`
   - `DB_PASSWORD`

4. Open a terminal in the `backend` directory and run on Windows:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

5. Serve the `frontend` directory using VS Code Live Server or another local web server.

6. For local development, ensure the frontend API base URL points to the local backend (`http://localhost:8080`). The deployed frontend uses the Railway backend URL.

## Deployment

- Frontend: https://studytrack-frontend-rrlp.vercel.app
- Backend: https://studytrack-production-fd8125e1.up.railway.app

The backend is hosted on Railway with a connected MySQL service. The frontend is hosted on Vercel.

## API

The registration route verified during testing is:

- `POST /api/auth/register`

Other login and task routes are consumed by the frontend. Consult the backend controller classes for their exact paths, methods, request formats, and response formats before adding them to this section. Do not guess API routes.

## Database

The verified tables include `user` and `task`. Task records include an ID, title, completion status, and `user_id` association. Confirm the final entity classes and schema for the complete list of columns and constraints.

## Testing Status

- Fresh clone completed a Maven clean build successfully.
- The build reported no automated tests to run.
- Registration was manually tested; the request returned HTTP 201 and the record was verified in the test database.
- Login, dashboard access, and logout were manually checked.
- Task completion remained saved after refreshing the dashboard.
- The deployed frontend was opened and tested on a phone.
- Basic task visibility was checked in the UI. This does not replace server-side authorization testing.

## Security Notes

- Never commit database passwords, tokens, or production secrets.
- Do not include production database backups or real user data in source archives.
- Restrict CORS to the actual frontend origin.
- Verify that the backend authenticates every task request and checks task ownership on the server.
- Use HTTPS for deployed traffic.

## Future Improvements

- Add backend unit and integration tests.
- Complete API-level authorization tests.
- Document all controller routes and request/response schemas.
- Review input validation and error handling.
- Confirm and document calendar and folders module behaviour.
- Consider Progressive Web App support.

## Project Links

- GitHub: https://github.com/5778srikruthi/StudyTrack
- Frontend: https://studytrack-frontend-rrlp.vercel.app
- Backend: https://studytrack-production-fd8125e1.up.railway.app

---
This README is based on the project details and manual test results currently available. Verify it against the latest source code before final academic submission.
