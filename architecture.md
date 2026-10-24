# Architecture and Authentication Flow

## Architecture
- React + Vite provides the user interface and client-side routes.
- AuthContext stores the current user and access-token session state.
- Axios service centralizes API requests and refresh retry behavior.
- Express routes call controllers, Mongoose models, and MongoDB.
- MongoDB collections: `users`, `posts`, and `comments`.

## Authentication flow
1. Register/login sends credentials to the backend over HTTPS in production.
2. Backend hashes passwords with bcryptjs and verifies them at login.
3. Backend returns a short-lived access JWT and sets a refresh JWT in an HttpOnly cookie.
4. The frontend keeps the access token in memory rather than localStorage.
5. On initial page load, the frontend requests `/api/auth/refresh`; the browser sends the cookie.
6. Refresh endpoint verifies and rotates the refresh token; the stored token hash is updated.
7. Axios retries an API request once after an access-token 401 by requesting a fresh access token.
8. Logout clears the stored refresh-token hash and cookie.

## Data relationships
- User 1-to-many Post (`Post.author` references `User._id`).
- User 1-to-many Comment (`Comment.author` references `User._id`).
- Post 1-to-many Comment (`Comment.post` references `Post._id`).
- Comment can reference another Comment through `parentComment`, supporting replies.

## Important production considerations
- Use HTTPS and `COOKIE_SECURE=true`.
- Keep access and refresh secrets different and private.
- Configure CORS to the exact deployed frontend origin.
- Add CSRF protection or a strict origin strategy appropriate to the deployment.
- Review refresh-token rotation and session invalidation before using real users.
- Rich text editor is not included; this version uses a textarea and plain text.
