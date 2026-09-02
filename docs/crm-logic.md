# 51 CRM — how the system actually works

A read of `american_crm.py` (3,600 lines) and the two databases behind it.
Written from the code and verified against the live data, not from the UI.

---

## 1. What the system is for

It tracks two kinds of lead through to enrolment.

**Education leads** (`american_leads`, 2,786 rows) — a student, the courses
they are considering, and a per-course status. This is the main business.

**Event leads** (`event_leads`, 122 rows) — a client attending an event, with a
payment status, a deposit and a checklist of requirements.

The two are parallel worlds. Almost every table, route and helper exists twice,
once per side, with `student_*` on one and `client_*` on the other.

---

## 2. Where the data lives

Two databases, and the split matters.

### MySQL (`crm51_db`) — the record

| Table | Rows | What it holds |
|---|---|---|
| `american_leads` | 2,786 | The education lead. One row per student. |
| `course_status` | 3,478 | One row per lead per course, with its own status. |
| `assignation` | 28,254 | Which users own which lead. Many-to-many. |
| `event_leads` | 122 | The event lead. |
| `event_assignation` | 173 | Ownership, event side. |
| `event_check_list` | 33 | Requirements per event lead. |
| `course` | 164 | The course catalogue, with a `hold` flag. |
| `subject` / `exam_trial` | 13 / 126 | The two halves a course name is built from. |
| `educational_system` | 1 | Lookup. |
| `user` | 15 | Accounts, roles, scope. |

### MongoDB (`crm_51`) — the conversation

| Collection | Docs | What it holds |
|---|---|---|
| `notifications` | 108,747 | One document per user per event. Read flags live here. |
| `american_notes` | 11,904 | The notes timeline for education leads. |
| `event_notes` | 418 | The same, event side. |
| `reply` | 15 | Replies to notifications. |
| `crm_notes` | 605 | Orphaned. Nothing in the code reads or writes it. |

**Nothing joins the two databases.** A lead's identity is its MySQL id, and
Mongo documents carry that id as a loose reference. Delete a lead and its notes
and notifications stay behind — `delete_student` clears three MySQL tables and
touches no collection. The 108,747 notifications include many for leads that no
longer exist; `add_notifications` handles this by writing the literal string
`"Profile Deleted"` when it cannot find the mobile number.

---

## 3. The education lead lifecycle

### Creation — `creating_american_lead`

Six fields are mandatory: mobile, name, educational system, status, at least
one assignee, and at least one course. The mobile is the natural key: a second
lead with the same number is refused, and the error names the existing id.

Creation is a four-step sequence, and it is **not** a transaction:

1. Insert the lead, commit, then re-read `LAST_INSERT_ID()` to get its id.
2. `add_assignation` — one row per assignee, each with a notification.
3. `add_notes` — the first note, into Mongo.
4. One `course_status` row per course, all at `pending`.

Step 2 has a hand-rolled rollback: if assignation fails, the code deletes the
lead, deletes the assignation rows, and deletes the Mongo notifications. Steps
3 and 4 have no such protection, so a failure there leaves a lead with no notes
or no course rows.

A course is matched to the catalogue by name, and only if `hold = false`. If it
does not match, `course_status.course_id` is left null but the row is still
written with the course name — so the catalogue link is optional and the text
is the real record.

### Status

The lead carries one status, and each of its courses carries its own.

- **Lead status**: `pending` → `enrol` / `not_interested`, plus
  `not_contacted` on the event side. Live counts: 1,909 enrol, 823
  not_interested, 54 pending.
- **Course status**: the same values per `course_status` row, changed one at a
  time through `change_status_course`.

The two are independent. A lead marked `enrol` can hold courses still
`pending`; nothing reconciles them.

Three rules are enforced on update, and only there — not on create:

- `pending` requires a **recall date**.
- `not_interested` requires a **reason**.
- `enrol` requires an **educational system id**, and is refused without one.

### Assignment

`assignation` is many-to-many: several counsellors can own one lead. Every
assignment writes a notification to the assignee. On update the code diffs the
submitted course list against the stored one and inserts or deletes
`course_status` rows to match.

### Recall dates

A lead due a call back carries `recall_date`. The recall pages query one date at
a time. Only **4 of 2,786 leads** have a recall date set, so the feature is
barely used in this data.

---

## 4. The event lead lifecycle

Same shape, different fields. `creating_event_lead` requires mobile, name,
status and an assignee. It adds:

- `client_payment_status` — `pending` or `completed`.
- `client_deposit_flag` and `client_deposit` — a deposit amount, enabled by the flag.
- A **checklist**: free-text requirement items, stored in `event_check_list`.
- **File upload**: one file per lead under `static/event_upload_files`, named
  `client_id_<id>.<ext>`. Upload, download and delete are separate routes.

`done` is `1`/`0` on the education side and `'yes'`/`'no'` on the event side —
the same concept stored two ways.

---

## 5. Users, roles and the public form

### Roles

`user.role` holds `admin`, `staff` or `all` — 5, 7 and 2 accounts. `scope`
holds `all`, `course` or `event`.

Authorisation is inconsistent by design of history rather than intent. The good
pattern, used by `/users` and `delete_student`, **re-reads the role from the
database** rather than trusting the session. Elsewhere `session['role']` is
trusted directly, and in the templates before this revamp, role was applied by
rendering everything and hiding it in JavaScript.

`/american_db` returns every lead to every role — both branches of its
`if role == 'admin'` are the same query. `/get_recall_date` does scope by
assignation for non-admins. There is no single rule.

### The public course form

`/course_form` is open to the public: a student fills it in and a lead is
created with `added_by = 'Course Form User'` and
`system_section = 'External Course Form'`.

To do that, the route **assigns a session** — name `External Course Form`,
id `0`, role `ExternalUser` — so the creation helper has an author to record.

**This was a live data leak.** `before_request` only checked that a session
existed, and only four routes out of about eighty-five checked for
`ExternalUser`. Anyone who submitted that form once received a session that
loaded `/american_db` and called `/api/american_leads`, returning all 2,786
leads with names, mobile numbers, parent numbers, emails and schools. Verified
by doing it, then fixed: `before_request` now treats that pseudo-session as no
session outside the public endpoints. The form still works; its session opens
nothing.

---

## 6. Notifications

Written to Mongo on assignment, on update, and by `/user_add_task`. Each
document is per user per event, so one lead assigned to eight people writes
eight documents — which is how the collection reached 108,747.

The bell polls `/get_read_notifications` every 60 seconds and shows the unread
count. Marking one read updates its `read` flag. Notifications are never
deleted except in the assignation rollback.

---

## 7. Reporting

`/profile` and `/event_profile` drive ten Google `ColumnChart`s from five
endpoints: `status_count`, `edu_count`, `course_analysis`, `course_analysis1..3`.
They aggregate by status, educational system and course, scoped to the
counsellor named in `username_profile`.

`/american_detailed_course_report` is `american_leads` LEFT JOINed to
`course_status` — one row per lead per course, 3,478 rows.

`/crm_excel_sheet` accepts an `.xlsx` upload, parses it with pandas and bulk
creates leads, keeping the uploaded files under `static/crm_excel_files`.

---

## 8. What I would fix next, in order

1. **Passwords are plaintext.** `user.password` is a `varchar(30)` compared with
   `if password == row[1]`. Everything else on this list is secondary.
2. **SQL built by string concatenation** in several routes — `/get_recall_date`
   interpolates a GET parameter straight into a `WHERE`. The newer `/api/*`
   endpoints are parameterised; the older ones are not.
3. **Authorisation is per-route and inconsistent.** It should be one decorator
   that names the required role, not eighty-five independent decisions.
4. **Creation is not transactional.** A failure after step 2 leaves a lead with
   no notes or no course rows.
5. **Mongo and MySQL drift.** Deleting a lead leaves its notes and
   notifications behind for ever.
6. **`crm_notes` is dead** — 605 documents nothing reads.
7. **`students` table does not exist**, but `/get_student_DB_data` still queries
   it and returns HTTP 500.
