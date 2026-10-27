# AI-Powered Citizen Grievance Redressal Platform

## 1. Project purpose

This system is for **Sathyamangalam Municipality, Erode District, Tamil Nadu**. It allows citizens to submit a municipal grievance, tracks the work completed by officers and employees, and lets higher officials intervene in overdue cases.

The system has five account types:

| Role | Main responsibility |
| --- | --- |
| Citizen | Register, submit, track, provide evidence, give feedback, and escalate overdue grievances. |
| Officer | Review assigned grievances, supervise employees, assign tasks, monitor work, and resolve grievances. |
| Employee | Complete only their own assigned tasks, add remarks/evidence, request a hold, and mark work complete. |
| Higher official | Monitor escalated, overdue, and critical grievances; record an intervention and close escalations. |

## 2. End-to-end workflow

```text
Citizen registers / logs in
        |
        v
Citizen submits grievance with ward, verified area, address, and optional photo
        |
        +--> System stores grievance + location snapshot + history entry
        +--> AI produces an advisory category/priority recommendation
        |
        v
Admin assigns the grievance to the appropriate department officer
        |
        v
Officer reviews AI recommendation and grievance details
        |
        +--> confirms or modifies category, priority, department and deadline
        +--> assigns one or more employees under that officer
        |
        v
Employee accepts task -> starts work -> adds remarks/evidence -> completes task
        |
        v
Officer verifies work -> marks grievance Resolved
        |
        +--> Citizen views resolution and submits one feedback record
        |
        v
If deadline passes before resolution: system marks grievance Overdue
        |
        v
Citizen creates escalation -> Higher official intervenes -> closes escalation
```

## 3. Status lifecycle

### Grievance statuses

`Submitted` -> `Under Review` -> `Assigned` -> `In Progress` -> `Resolved` -> `Closed`

Other supported operational statuses are `On Hold`, `Overdue`, `Rejected`, and `Reopened`.

### Task statuses

`Assigned` -> `Accepted` -> `In Progress` -> `Completed`

An employee may move an accepted or in-progress task to `On Hold`, then resume it to `In Progress`.

### Escalation statuses

`Open` -> `Under Review` -> `Action Taken` -> `Closed`

## 4. How assignment works

1. A citizen does **not** select an officer.
2. The admin reviews the grievance and assigns an officer from the appropriate department.
3. The assigned officer sees the grievance in the Officer Dashboard.
4. The officer can assign one or more employees that belong to that officer and department.
5. Employees cannot view or update other employees' tasks.

## 5. Main database collections

| Collection/model | Content |
| --- | --- |
| `User` | Citizen, officer, employee, higher-official, and admin identities and role relations. |
| `Department` | Municipal departments and codes. |
| `Location` | The 27 ward master records, verified areas, streets, and boundary descriptions. |
| `Grievance` | Citizen submission, location snapshot, category, status, department, officer, deadline, AI analysis, resolution, and evidence. |
| `Task` | One employee's assigned work for one grievance. |
| `GrievanceHistory` | Permanent audit entries for important workflow actions. |
| `Escalation` | Citizen escalation of an overdue grievance and higher-official action. |
| `Notification` | In-app notification records. |
| `Feedback` | One citizen rating/comment per resolved grievance. |

## 6. Backend file guide

All backend files are under `server/`.

### Application and configuration

| File | Content / how it works |
| --- | --- |
| `server.js` | Express application entry point. Loads environment variables, connects MongoDB, registers API routes, enables CORS/JSON, and runs the overdue check at startup and hourly. |
| `package.json` | Node dependencies and commands. Includes `start`, `seed:wards`, and `seed:municipality`. |
| `src/server.js` | Legacy/secondary source entry file. The active npm start command uses `server.js`. |

### Middleware

| File | Content / how it works |
| --- | --- |
| `middleware/authMiddleware.js` | Reads the JWT from the `Authorization: Bearer <token>` header and returns 401 for missing/invalid tokens. |
| `middleware/roleMiddleware.js` | Allows only specified roles through a protected endpoint and returns 403 for forbidden access. |

### Models

| File | Content / how it works |
| --- | --- |
| `models/User.js` | Defines account data: name, email, hashed password, phone, role, department, supervisor officer, designation, address, and active state. |
| `models/Department.js` | Defines a municipal department with name, unique code, description, and active state. |
| `models/Location.js` | Defines one municipal ward with ward number, name, verified areas, area streets, and boundary description. |
| `models/Grievance.js` | Defines the main grievance record, embedded location snapshot, AI analysis, status, deadline, evidence, feedback snapshot, and reopen request. |
| `models/Task.js` | Defines employee task data: grievance, employee, assigning officer, task description, state, remarks, evidence, deadline, and timestamps. |
| `models/GrievanceHistory.js` | Defines the audit timeline entry: action, status, remark, actor, role, and timestamp. |
| `models/Escalation.js` | Defines escalation reason, citizen, higher official, action, revised deadline, priority, and state. |
| `models/Notification.js` | Defines notification user, linked grievance, type, message, read state, and timestamps. |
| `models/Feedback.js` | Defines the one-per-grievance citizen rating and comment. |

### Services

| File | Content / how it works |
| --- | --- |
| `services/aiAnalysisService.js` | Provides a local, keyword-based AI-style recommendation for category, severity, summary, keywords, and confidence. It is advisory only; it never silently changes official values. |
| `services/workflowService.js` | Reusable helpers to create history entries and notifications. `checkOverdueGrievances()` marks unresolved past-deadline grievances as `Overdue`. |

### Controllers

| File | Content / how it works |
| --- | --- |
| `controllers/authController.js` | Public citizen registration, login, bcrypt password comparison, JWT generation, and safe user response. Public registration always creates the `citizen` role. |
| `controllers/locationController.js` | Returns verified wards, areas for a ward, streets for an area, and allows admin ward management. |
| `controllers/grievanceController.js` | Creates grievances, validates ward/area/street against the master data, stores the location snapshot/evidence, runs advisory AI analysis, gets citizen grievances/details/history, and supports the legacy feedback/reopen operations. |
| `controllers/adminController.js` | Supplies admin grievance lists/statistics/officers and assigns a grievance to an officer. It also contains feedback/reopen review functions. |
| `controllers/officerController.js` | Gets officer grievances/employees with workload. Updates grievance status/resolution and records an officer review of category, priority, department, and deadline. |
| `controllers/taskController.js` | Creates multiple employee tasks, gets an employee's tasks, validates status changes, records remarks/evidence, and lets the assigned officer view grievance tasks. |
| `controllers/escalationController.js` | Allows only the grievance owner to create one escalation when the grievance is overdue. |
| `controllers/higherOfficialController.js` | Supplies higher-official dashboard counts/lists and updates escalation intervention, priority, revised deadline, and closure. |
| `controllers/notificationController.js` | Lists the current user's in-app notifications and marks an owned notification read. |
| `controllers/feedbackController.js` | Creates a single feedback record only after a citizen's grievance is resolved or closed. |

### Routes

| File | Endpoint group |
| --- | --- |
| `routes/authRoutes.js` | `/api/auth` — register and login. |
| `routes/locationsRoutes.js` | `/api/locations` — wards, areas, streets, and admin ward data. The actual file is named `locationRoutes.js`. |
| `routes/grievanceRoutes.js` | `/api/grievances` — citizen submit, own list, own detail, feedback, and reopen. |
| `routes/adminRoutes.js` | `/api/admin` — administration, assignment, dashboard, officer list, feedback, and reopen requests. |
| `routes/officerRoutes.js` | `/api/officer` — officer grievance list/details, employee workload, status update, and review. |
| `routes/taskRoutes.js` | `/api/tasks` — task assignment, employee task list/update, officer task list. |
| `routes/escalationRoutes.js` | `/api/escalations` — citizen escalation creation. |
| `routes/higherOfficialRoutes.js` | `/api/higher-official` — oversight dashboard, escalation list/actions, overdue/critical list. |
| `routes/notificationRoutes.js` | `/api/notifications` — current-user notifications/read action. |
| `routes/feedbackRoutes.js` | `/api/feedback` — citizen feedback creation. |
| `routes/testRoutes.js` | Small development/test route group. |

> Note: The route file is `locationRoutes.js`, not `locationsRoutes.js`; the table uses the plural endpoint name for clarity.

### Seed scripts

| File | Content / how it works |
| --- | --- |
| `scripts/seedWards.js` | Inserts/updates all 27 Sathyamangalam wards with official locality/boundary references. |
| `scripts/seedMunicipality.js` | Inserts/updates 11 departments, 33 officers, 55 employees, 3 citizens, one higher official, and one admin. |

## 7. Frontend file guide

All frontend files are under `client/`.

### Core files

| File | Content / how it works |
| --- | --- |
| `src/main.jsx` | React entry point; mounts the application. |
| `src/App.jsx` | React Router route map for all available pages. |
| `src/api.js` | Shared fetch helper. Adds JSON headers and JWT automatically, then throws API error messages. |
| `src/index.css` | Global Tailwind/CSS styles and shared class styling. |
| `src/App.css` | Application-specific CSS. |
| `src/components/UI.jsx` | Reusable portal navigation, page header, alert, badge, and status/priority colour helpers. |

### Authentication pages

| File | Content / how it works |
| --- | --- |
| `pages/Register.jsx` | Public registration form. Sends name, email, phone, and password to `/api/auth/register`; users are always created as citizens. |
| `pages/Login.jsx` | Login form. Stores JWT/user data in local storage and redirects by role to citizen, officer, employee, higher-official, or admin dashboards. |

### Citizen pages

| File | Content / how it works |
| --- | --- |
| `pages/CitizenDashboard.jsx` | Loads the citizen's grievances, displays counts and cards, and links to submission/detail pages. |
| `pages/SubmitGrievance.jsx` | Loads wards, then verified areas, then streets. Submits a location snapshot and optional image evidence. |
| `pages/GrievanceDetails.jsx` | Shows grievance information, structured location, assigned officer, stored evidence, and the actual history timeline returned by the backend. |

### Officer pages

| File | Content / how it works |
| --- | --- |
| `pages/OfficerDashboard.jsx` | Shows grievances assigned to the logged-in officer and department work information. |
| `pages/OfficerGrievanceDetails.jsx` | Displays individual officer grievance data and allows the officer to update status/resolution. |

### Employee pages

| File | Content / how it works |
| --- | --- |
| `pages/EmployeeDashboard.jsx` | Lists only tasks assigned to the logged-in employee. |
| `pages/EmployeeTaskDetails.jsx` | Lets an employee accept/start/resume/complete work, request a hold, save remarks, and attach work-evidence images. |

### Higher-official pages

| File | Content / how it works |
| --- | --- |
| `pages/HigherOfficialDashboard.jsx` | Shows escalation, overdue, critical, and resolution dashboard counts. |
| `pages/Escalations.jsx` | Lists escalated cases and lets the higher official begin the review process. |

### Admin and shared pages

| File | Content / how it works |
| --- | --- |
| `pages/AdminDashboard.jsx` | Shows system-level grievance statistics for an admin. |
| `pages/AdminGrievances.jsx` | Lists grievances for admin review and assignment. |
| `pages/AdminGrievanceDetails.jsx` | Shows full grievance data and supports assignment to an officer. |
| `pages/Notifications.jsx` | Lists in-app notifications and marks them read when clicked. |

### Static/configuration files

| File | Content / how it works |
| --- | --- |
| `package.json` | Vite/React dependencies and npm commands. |
| `vite.config.js` | Vite development/build configuration. |
| `index.html` | HTML document used by Vite. |
| `public/favicon.svg`, `public/icons.svg` | Browser/favicon and icon assets. |
| `src/assets/*` | Image assets used by the interface. |

## 8. Important API calls

| Method | URL | Who uses it | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Creates a citizen account. |
| POST | `/api/auth/login` | All roles | Authenticates and returns JWT/user details. |
| GET | `/api/locations/wards` | Citizen | Gets all verified wards. |
| GET | `/api/locations/wards/:wardNumber/areas` | Citizen | Gets areas in the selected ward. |
| GET | `/api/locations/wards/:wardNumber/areas/:areaId/streets` | Citizen | Gets streets in the selected area. |
| POST | `/api/grievances` | Citizen | Creates a grievance. |
| GET | `/api/grievances/my` | Citizen | Gets only the current citizen's grievances. |
| GET | `/api/grievances/:id` | Citizen | Gets only the current citizen's grievance + history. |
| GET | `/api/admin/grievances` | Admin | Gets all grievances. |
| PUT | `/api/admin/grievances/:id/assign` | Admin | Assigns a grievance to an officer. |
| GET | `/api/officer/grievances` | Officer | Gets own assigned grievances. |
| PATCH | `/api/officer/grievances/:id/review` | Officer | Confirms/modifies recommendation and review values. |
| POST | `/api/tasks/assign` | Officer | Assigns one task to each selected employee. |
| GET | `/api/tasks/my-tasks` | Employee | Gets only own tasks. |
| PUT | `/api/tasks/:id/status` | Employee | Updates own task state, remarks, and evidence. |
| POST | `/api/escalations` | Citizen | Creates an escalation for an overdue owned grievance. |
| GET | `/api/higher-official/escalations` | Higher official | Gets escalation list. |
| PATCH | `/api/higher-official/escalations/:id` | Higher official | Saves intervention/action/deadline/closure. |
| GET | `/api/notifications` | Any logged-in user | Gets current user's notifications. |
| PATCH | `/api/notifications/:id/read` | Notification owner | Marks one notification read. |
| POST | `/api/feedback` | Citizen | Creates one post-resolution feedback record. |

## 9. Setup and run instructions

### Required environment values

Create `server/.env` with:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret
PORT=5000
# Optional: changes the password used by seed data
SEED_PASSWORD=ChangeMe@123
```

### Install and seed

```powershell
cd citizen-grievance-redressal-platform/server
npm install
npm.cmd run seed:wards
npm.cmd run seed:municipality
npm.cmd start
```

In a second terminal:

```powershell
cd citizen-grievance-redressal-platform/client
npm install
npm.cmd run dev
```

Open the Vite URL normally shown as `http://localhost:5173`.

## 10. Seeded demonstration accounts

The seed password is `ChangeMe@123` unless `SEED_PASSWORD` was set before running the seed.

| Role | Example email | Mobile Number | Notes |
| --- | --- | --- | --- |
| Higher official | `higher.official@sathyamangalam.gov.in` | `9842000001` | District / Municipal Higher Official |
| System Admin | `admin@sathyamangalam.gov.in` | `9842000002` | Grievance Redressal Cell Head |
| Citizen | `anitha.citizen@sathyamangalam.gov.in` | `9842100001` | Nadar Colony, Ward 1 |
| Citizen | `karthik.citizen@sathyamangalam.gov.in` | `9842100002` | Bazaar Street, Ward 16 |
| Citizen | `meena.citizen@sathyamangalam.gov.in` | `9842100003` | Athani Road, Ward 11 (Differently Abled) |
| Electricity Officer | `electric-officer-1@sathyamangalam.gov.in` | `9000ELEC1` | Electricity & Power Services Nodal Officer |
| Water Supply Officer | `water-officer-1@sathyamangalam.gov.in` | `9000WATE1` | Water Supply & Resources Officer |
| Health Officer | `health-officer-1@sathyamangalam.gov.in` | `9000HEAL1` | Public Health & Medical Officer |

For each of the **16 official Sathyamangalam departments** (`agri`, `food`, `water`, `electric`, `roads`, `health`, `rural`, `edu`, `women`, `child`, `env`, `tour`, `sanit`, `animal`, `employ`, `other`), seeded officer emails use:

```text
<code>-officer-1@sathyamangalam.gov.in
<code>-officer-2@sathyamangalam.gov.in
```

Seeded employee emails use:

```text
<code>-employee-1@sathyamangalam.gov.in
...
<code>-employee-5@sathyamangalam.gov.in
```

## 11. Security rules implemented by the API

- Passwords are stored using bcrypt hashes.
- JWT includes user ID and role.
- Public registration cannot create officer, employee, higher-official, or admin accounts.
- Citizen grievance endpoints are limited to the grievance owner.
- Employee task updates are limited to the assigned employee.
- Officer task and grievance views are limited to the assigned officer.
- Higher-official endpoints require the `higher_official` role.
- Admin endpoints require the `admin` role.
- Location validation restricts submission to the 27 Sathyamangalam wards and selected verified master data.

## 12. Verification checklist

1. Run ward and municipality seeds.
2. Login as a citizen and submit a grievance.
3. Login as admin and assign it to a matching officer.
4. Login as that officer; review the grievance and assign an employee.
5. Login as the employee; accept, start, add evidence, and complete the task.
6. Login as the officer; verify and resolve it.
7. Login as the citizen; inspect history/evidence and submit feedback.
8. For overdue testing, set a grievance due date in the past, restart/wait for the overdue checker, then create an escalation as the citizen.
9. Login as higher official and update/close the escalation.
