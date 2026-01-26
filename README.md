# SimplePass

SimplePass is a modern, full‑stack school hall‑pass management system built with **Node.js**, **Express**, **React**, and **MongoDB**. It streamlines how students request passes, how teachers approve them, and how administrators oversee school‑wide activity — all in one unified platform.

---

## ✨ Features

### 🎒 Student Features

- Create hall passes with destination, reason, and time.
- Real‑time status updates when teachers approve or deny requests.

### 👩‍🏫 Teacher Features

- Approve or deny student pass requests.
- View active passes for their classes.
- Quick‑action interface for high‑traffic classrooms.

### 🛠 Admin Dashboard

- Manage students, teachers, and staff accounts.
- Manage school locations.
- Role‑based access control (RBAC).

### 🏫 Multi‑School Support

- Each school has its own users, settings, and pass rules.

### ⚡ Tech Highlights

- Real‑time updates via WebSockets.
- Secure authentication with JWT.
- Modular API architecture.
- Responsive React UI.

---

## 🏗 Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Frontend   | React, Vite, Axios                   |
| Backend    | Node.js, Express.js                  |
| Database   | MongoDB + Mongoose                   |
| Auth       | JWT-based authentication             |
| Realtime   | Socket.io                            |
| Deployment | No formal deployment as of right now |

---

## 📁 Project Structure

```
simplepass/
│
├── Frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── backendCalls.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
│
├── Backend/
│   ├── controllers/
│   ├── data/
│   ├── jobs/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── app.js
│   ├── package-lock.json
│   ├── package.json
│   ├── request.rest
│   └── server.js
│
├── .vscode/
├── scripts/
├── .gitignore
├── LICENSE
├── package-lock.json
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/simplepass.git
cd simplepass
```

### 2. Install Dependencies

#### Backend

```bash
cd Backend
npm i
```

#### Frontend

```bash
cd Frontend
npm i
```

### 3. Environment Variables

Create a `.env` file in `/Backend`:

```
ACCESS_TOKEN_SECRET=your_secret_key
REFRESH_TOKEN_SECRET=your_secret_key
INVITE_CODE=your_secret_code
GOOGLE_CLIENT_ID=your_secret_key
MONGO_URI=your_mongodb_uri
```

## ▶ Running the App

### Start Backend

```bash
cd Backend
npm run dev || node server.js
```

### Start Frontend

```bash
cd Frontend
npm run dev
```

The app will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## 🔐 Authentication & Roles

SimplePass uses **role‑based access control**:

| Role    | Permissions                               |
| ------- | ----------------------------------------- |
| Student | Create/view passes                        |
| Teacher | Approve/deny passes, view active passes   |
| Admin   | Manage users, school, settings, analytics |

---

## 📡 API Overview

### Example Endpoints

| Method | Endpoint          | Description    |
| ------ | ----------------- | -------------- |
| POST   | `/api/auth/login` | Login user     |
| GET    | `/api/passes`     | Get all passes |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Open a pull request

---

## 💬 Contact

For questions or suggestions, open an issue or reach out to me :D

---

### 🎉 Thanks for checking out SimplePass!
