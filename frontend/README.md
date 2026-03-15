# FinSure Angular Frontend

Angular frontend matching the current Spring Boot backend in this repository.

## Backend assumptions

- API base path is `/api`
- Backend runs on `http://localhost:8082`
- Login returns only a raw JWT string
- Registration always creates a `CUSTOMER`
- Customer loan APIs require `userId` in the URL

Because the backend does not expose a `current user` endpoint and the JWT contains only the email, the login form asks customer users for their numeric `userId`. Officer users do not need a user ID.

## Run

```bash
cd frontend
npm install
npm start
```

The Angular dev server uses `proxy.conf.json`, so `/api` requests are forwarded to `http://localhost:8082` without requiring backend CORS changes.
