## Stock Management System

This repository contains a **full‑stack stock and attendance management system** with:
- **Backend** (`stock-management-server`): Node.js/Express API with MongoDB and Mongoose.
- **Frontend** (`stock-management-web`): React + Vite dashboard UI (React Router, Redux Toolkit, MUI, Tailwind).

The system manages:
- **Users & roles** (e.g. owner, core team, manager)
- **Stock items** and inventory
- **Stock transfers** between locations/users
- **Attendance / check‑in & check‑out**

---

### Project Structure

- **`stock-management-server`** – Express server
  - `server.js` – main entry, route mounting and middleware
  - `routes/` – API route definitions
    - `user.routes.js` – user auth & management endpoints
    - `stock.routes.js` – stock CRUD and inventory operations
    - `stockTransfer.routes.js` – stock transfer endpoints
    - `attendance.routes.js` – attendance related routes
    - `excelStock.routes.js` – legacy Google Sheets / Excel stock routes
  - `controllers/` – business logic for each feature
    - `userController.js`, `stockController.js`, `stockTransferController.js`, `attendanceController.js`, `excelController.js`, etc.
  - `models/` – Mongoose models
    - `user.model.js`, `stockTransfer.model.js`, `attendance.model.js`, `response.model.js`, ...
  - `middleware/` – shared Express middleware (e.g. auth)
  - `utils/` – helpers like `emailService.js`, `validation.js`
  - `db.js` – MongoDB connection

- **`stock-management-web`** – React front‑end
  - `src/main.jsx` / `src/App.jsx` – app bootstrap and routing
  - `src/pages/` – top‑level pages (`Login`, `Register`, `Dashboard`, `Stock`, `StockTransfer`, `Users`, `Inventory`, `Reports`, `Settings`, `Profile`, `ForgotPassword`, `ResetPassword`, etc.)
  - `src/components/` – reusable UI pieces
    - Layout (`Layout`, `Navbar`, `Sidebar`)
    - Dashboard widgets (`StockCard`, `StockCardsGrid`, quick actions)
    - Dashboard views per role (`owner-dashboard`, `manager-dashboard`, `coreTeamDashboard`, `stockTransfer`)
    - Tables & pagination (`Table`, `Pagination`, MUI‑style columns)
    - Forms and inputs (`Input`, `InputPassword`, `Select`, `PasswordStrength`, buttons, modals, snackbars, loaders)
  - `src/redux/` – Redux Toolkit slices for auth, snackbar, etc.
  - `src/services/` – API clients (`user.js`, `stockTransfer.js`, `config.js`)
  - `src/utils/` – generic utilities (`api.js`, `request.js`, `validation.js`)
  - `tailwind.config.js`, `postcss.config.js`, `vite.config.js` – tooling configs

---

### Backend – Getting Started

1. **Install dependencies**
   ```bash
   cd stock-management-server
   npm install
   ```

2. **Create `.env` in `stock-management-server`**
   Typical variables (adjust to your environment):
   ```bash
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/stock-management
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   # Email / Cloudinary / Google API keys if used:
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   ```

3. **Run the server**
   ```bash
   npm run dev    # with nodemon
   # or
   npm start
   ```

The server exposes:
- `/api/user` – authentication & user management
- `/api/stock` – stock and inventory APIs
- `/api/stock-transfer` – stock transfer APIs
- `/api/attendance` – attendance/check‑in/check‑out
- legacy Excel/Google Sheets routes via `excelStock.routes.js`

---

### Frontend – Getting Started

1. **Install dependencies**
   ```bash
   cd ../stock-management-web
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

3. Open the app in your browser (by default Vite runs at `http://localhost:5173`).

The UI includes:
- **Authentication flow** – login, register, forgot/reset password
- **Role‑based dashboards** – views for owner, manager, core team
- **Stock management** – list, filter, add, edit, and delete stock
- **Stock transfers** – initiate and track transfers between parties/locations
- **Attendance** – view and manage attendance/checkout records
- **Reports & inventory views** – for higher‑level insights

---

### Development Notes

- **Tech stack**
  - Backend: Node.js, Express, MongoDB/Mongoose, JWT, sessions, Nodemailer, Cloudinary, Google APIs, Handlebars (`hbs`) for any server‑rendered views.
  - Frontend: React, Vite, React Router, Redux Toolkit, MUI, Tailwind CSS, rc-table/rc-pagination, react-hook-form.
- **API base URLs**
  - Backend CORS is configured to allow `FRONTEND_URL` from `.env`. When deploying, update `FRONTEND_URL` and any API base URLs used in `stock-management-web/src/services/config.js`.

---

### How to Extend

- **Add a new API endpoint**
  - Create or update a controller in `stock-management-server/controllers/`.
  - Wire it in via a route file under `stock-management-server/routes/`.
  - Update or create corresponding front‑end service in `stock-management-web/src/services/`.
  - Add UI changes in the appropriate page/component.

- **Add a new dashboard widget/page**
  - Create a React component in `stock-management-web/src/components/Dashboard/...`.
  - Add routing in `src/App.jsx` and any role‑based access checks via `ProtectedRoute`.

This `README.md` is meant as a high‑level guide so you can quickly remember **what is going on in this project** and how to run and extend it.
