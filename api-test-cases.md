# Manual API Test Plan

Base URL: `http://localhost:5000`

These are test cases to execute, not a claim that they have already passed. Use Postman and your own test account.

| Test | Request | Expected |
|---|---|---|
| Health | `GET /api/health` | 200; database connected |
| Register | `POST /api/auth/register` with name/email/password | 201 and accessToken |
| Duplicate email | Register same email twice | 409 |
| Login wrong password | `POST /api/auth/login` with incorrect password | 401 |
| Refresh | `POST /api/auth/refresh` with refresh cookie | New access token and rotated cookie |
| Logout | `POST /api/auth/logout` | Cookie cleared |
| Profile | `GET /api/auth/me` with Bearer access token | Current user |
| Update profile | `PATCH /api/auth/me` | Updated name/bio |
| List posts | `GET /api/posts?page=1&limit=10` | Post list and pagination |
| Search posts | `GET /api/posts?search=react` | Matching posts |
| Create post | `POST /api/posts` with Bearer token | 201 |
| Update own post | `PATCH /api/posts/POST_ID` | Updated post |
| Update another user's post | PATCH using non-owner's token | 404 |
| Like | `POST /api/posts/POST_ID/like` | Like state and count |
| Add comment | `POST /api/posts/POST_ID/comments` | 201 |
| Add reply | Add comment with `parentComment` ID | Reply linked to parent |
| Delete comment | `DELETE /api/comments/COMMENT_ID` with author token | 200 |
| Protected route without token | `POST /api/posts` without Authorization | 401 |

## Screenshot evidence
Capture genuine screenshots after running the app:
1. Registration and login responses (hide tokens).
2. Homepage with blog cards.
3. Post creation and details page.
4. Editing/deleting a post as its owner.
5. Nested comment/reply display.
6. Profile update.
7. MongoDB collections and `/api/health`.
8. Search results and pagination response.
