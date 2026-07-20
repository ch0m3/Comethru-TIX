# ComeThru Tix — Backend

## What changed in this version

The frontend's event-image field now offers drag-and-drop / browse-to-
upload, in addition to pasting a URL (see `ImageUploadField.jsx`).
Uploaded files are converted to a base64 **data URL** client-side and
sent as `image_url`, exactly like before — no new endpoint or field name,
just a much longer string sometimes. Two things changed here to support
that:

1. `Event.image_url` is now `db.Text` instead of `db.String(500)` — the
   old length would truncate or reject a data URL.
2. `MAX_CONTENT_LENGTH` (10MB) is set on the Flask app, and `POST /events`
   / `PUT /events/<id>` now reject an `image_url` over ~8MB with a clear
   `{"error": "Image is too large."}` instead of a generic 413 or a
   silently truncated image. This mirrors the frontend's own 5MB file
   cap.

**If you already have a database from the previous version:** SQLite
doesn't actually enforce `VARCHAR` length limits, so existing `app.db`
files keep working with no migration needed. If you switch to Postgres
later, run a migration to `ALTER COLUMN image_url TYPE TEXT` (or just
recreate the table via `seed.py` on a fresh database) — a `String(500)`
column there would truncate or reject a data URL.



A Flask API built to match the `comethru_v3` frontend's `apiRequest` calls
exactly (see `src/api/client.js` and every page under `src/pages/` in the
frontend project).

## Stack

- Flask + Flask-SQLAlchemy (ORM)
- Flask-Migrate (migrations)
- Flask-JWT-Extended (JWT auth, role stored as a custom claim)
- Flask-Bcrypt (password hashing)
- Flask-Cors
- itsdangerous (signed, short-lived password-reset tokens — no email
  service wired up yet; the reset link is printed to the console)

## Getting it running

```
cd backend
python -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then edit ADMIN_EMAIL / ADMIN_PASSWORD
python seed.py                  # creates tables, categories, first admin
python run.py
```

The API runs at `http://localhost:5000`. Point the frontend's
`VITE_API_BASE_URL` at `http://localhost:5000/api`.

Log in as the seeded admin at `/admin/login` using whatever
`ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `.env`.

## Folder structure

```
app/
  models/       one file per table: User, Event, TicketType, Booking, Category
  routes/       one file per group of endpoints (auth, events, bookings, admin)
  utils/
    decorators.py   role_required() — enforces role checks server-side
    tokens.py       signed forgot/reset-password tokens
  config.py     reads settings from environment variables
  extensions.py shared Flask extension instances
seed.py         creates tables + starting categories + first admin
run.py          starts the dev server
```

## How roles and auth work

Every login route issues a JWT with the user's role baked in as a custom
claim:

```python
create_access_token(identity=str(user.id), additional_claims={"role": user.role})
```

`role_required("organizer")` (and similar) reads that claim to gate a
route — so even a hand-crafted request with a customer's token gets a 403
from `POST /api/events`, not just a hidden button in the UI.

**Account statuses**

- Customers are `active` immediately on registration (frontend
  auto-logs them in right after registering).
- Organizers register as `pending` — they cannot log in until an admin
  sets their status to `active` via `PUT /api/admin/users/<id>`. This
  matches the "Account submitted, pending admin review" screen in
  `OrganizerRegister.jsx`.
- Any account can be `deactivated` by an admin, which blocks login.
- There is no admin self-registration route — the only admin account is
  the one `seed.py` creates from `.env`.

## API reference

All routes are prefixed with `/api`. Every error response is
`{ "error": "message" }`, which is what the frontend's `apiRequest()`
throws as `err.message`.

### Auth (`/auth`)

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/auth/customer/register` | – | `name, email, password` | status starts `active` |
| POST | `/auth/organizer/register` | – | `name, email, password, business_name` | status starts `pending` |
| POST | `/auth/customer/login` | – | `email, password` | → `{ user, access_token }` |
| POST | `/auth/organizer/login` | – | same | rejects `pending`/`deactivated` |
| POST | `/auth/admin/login` | – | same | |
| PUT | `/auth/me` | any role | any of `name, email, password` | partial update |
| POST | `/auth/forgot-password` | – | `email` | always returns the same message; logs a reset link to the console |
| POST | `/auth/reset-password` | – | `token, new_password` | → `{ role, message }` |

### Events (`/events`)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/events` | optional | admin → all; organizer → only their own (any status); everyone else → only `approved` |
| GET | `/events/<id>` | optional | non-approved events 404 for anyone but their organizer/admin |
| POST | `/events` | organizer | `title, date, location` required; `description, image_url` optional; starts `pending` |
| PUT | `/events/<id>` | organizer (owner only) | partial update |
| POST | `/events/<id>/ticket-types` | organizer (owner only) | `name, price, quantity_available` |

### Bookings (`/bookings`)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/bookings?event_id=` | any role | customer → own; organizer → across their events (optionally filtered to one `event_id`); admin → all |
| POST | `/bookings` | customer | `ticket_type_id, quantity`; validates the event is `approved` and enough tickets remain |
| PUT | `/bookings/<id>` | customer (owner) | only supported change is `{ "status": "cancelled" }`; restores ticket availability |

### Admin (`/admin`)

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/users` | all users |
| PUT | `/admin/users/<id>` | `{ status }` — `active`, `pending`, or `deactivated` |
| DELETE | `/admin/users/<id>` | cascades to their events/bookings; restores ticket availability for cancelled bookings first |
| GET | `/admin/events` | all events, any status |
| PUT | `/admin/events/<id>/approve` | |
| PUT | `/admin/events/<id>/reject` | |
| PUT | `/admin/events/<id>/blacklist` | `{ reason }` — auto-cancels every confirmed booking for that event |
| DELETE | `/admin/events/<id>` | cascades to ticket types + their bookings |
| GET | `/admin/reports` | `{ bookings, users, events, revenue_over_time, top_events }` — see `Reports.jsx` |

## Known limitations / good next steps

- **No real email delivery.** `forgot_password()` logs the reset link to
  the console instead of sending an email — see the `TODO` in
  `app/routes/auth.py` for where to wire in SendGrid/SES/Postmark.
- **`db.create_all()` instead of real migrations.** Fine for getting
  started; before the schema changes often, switch to
  `flask db init && flask db migrate -m "initial tables" && flask db upgrade`.
- **No automated tests yet.** A good first pytest suite: a customer
  cannot reach `/api/admin/*` (403), an organizer cannot edit another
  organizer's event (403), booking reduces `quantity_available`
  correctly and cancelling restores it, and an organizer account cannot
  log in while `pending`.
- **Categories aren't assigned anywhere yet.** The model and many-to-many
  relationship exist and are seeded with some defaults, but no form in
  the frontend lets an organizer tag an event with a category yet.
- **This sandbox has no outbound network access**, so this backend was
  written and reviewed carefully but not run end-to-end here. Run
  `python seed.py && python run.py` locally and smoke-test the auth flow
  first — that's where a typo would show up fastest.
