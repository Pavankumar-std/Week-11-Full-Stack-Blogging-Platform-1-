# Week 11 — Full Stack Blogging Platform

A MERN-style blogging platform with a React frontend, Express API, MongoDB/Mongoose, JWT access tokens, refresh-token cookies, blog CRUD, comments/replies, likes, search, and profile settings.

> This is a starter implementation. Configure your own MongoDB and secrets, install dependencies, and test every flow before submitting it as completed. Screenshots and deployment evidence must be captured from a real running application.

## Requirements
- Node.js 18+
- npm
- MongoDB Atlas account or local MongoDB
- Browser and Postman (recommended)

## Folder structure
```text
Week-11-Full-Stack-Blogging-Platform/
├── frontend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── App.js
│       ├── main.js
│       ├── styles.css
│       ├── context/AuthContext.js
│       ├── components/ProtectedRoute.js
│       ├── components/Navbar.js
│       ├── pages/Home.js
│       ├── pages/Login.js
│       ├── pages/Register.js
│       ├── pages/PostDetails.js
│       ├── pages/PostEditor.js
│       ├── pages/Profile.js
│       └── services/api.js
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── config/database.js
│       ├── models/User.js
│       ├── models/Post.js
│       ├── models/Comment.js
│       ├── middleware/auth.js
│       ├── controllers/authController.js
│       ├── controllers/postController.js
│       ├── controllers/commentController.js
│       ├── routes/authRoutes.js
│       ├── routes/postRoutes.js
│       ├── routes/commentRoutes.js
│       └── utils/asyncHandler.js
├── docs/
│   ├── architecture.md
│   └── screenshots/README.txt
└── tests/api-test-cases.md
```

## Run locally

### 1. Backend
```bash
cd backend
npm install
```
Copy `.env.example` to `.env`, then set:
- `MONGODB_URI` to your own Atlas connection string
- `JWT_ACCESS_SECRET` to a random secret at least 32 characters long
- `JWT_REFRESH_SECRET` to a different random secret at least 32 characters long
- `CLIENT_URL=http://localhost:5173`

Start:
```bash
npm run dev
```
The API runs on `http://localhost:5000`.

### 2. Frontend
Open another terminal:
```bash
cd frontend
npm install
```
Copy `.env.example` to `.env`, set `VITE_API_URL=http://localhost:5000/api`, then run:
```bash
npm run dev
```
Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## Main API endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login and issue access token + refresh cookie |
| POST | `/api/auth/refresh` | Refresh cookie | Rotate refresh token and issue access token |
| POST | `/api/auth/logout` | Refresh cookie optional | Clear refresh cookie |
| GET | `/api/auth/me` | Access token | Current profile |
| PATCH | `/api/auth/me` | Access token | Update name/bio |
| GET | `/api/posts` | No | List/search/paginate posts |
| POST | `/api/posts` | Access token | Create post |
| GET | `/api/posts/:id` | No | Read post |
| PATCH | `/api/posts/:id` | Owner | Update post |
| DELETE | `/api/posts/:id` | Owner | Delete post |
| POST | `/api/posts/:id/like` | Access token | Toggle like |
| GET | `/api/posts/:id/comments` | No | List comments and replies |
| POST | `/api/posts/:id/comments` | Access token | Add comment or reply |
| DELETE | `/api/comments/:id` | Owner | Delete own comment |

## Authentication design
- Passwords are hashed using bcryptjs.
- Access tokens are short-lived JWTs returned in JSON and held in frontend memory.
- Refresh tokens are stored in an HttpOnly cookie and rotated on refresh.
- Frontend attempts `/auth/refresh` on initial load and after an access-token 401.
- Production deployment must use HTTPS and `COOKIE_SECURE=true`. Keep secrets out of GitHub.

## Notes
- Blog body uses plain text/textarea in this starter; a rich text editor can be added as an enhancement.
- Nested comments are represented using a `parentComment` reference; replies are queried under their parent.
- Search and pagination are supported on the post listing endpoint.
- Configure CORS to your trusted frontend origin for production.
- Capture genuine screenshots in `docs/screenshots/` after you run and test the app.
