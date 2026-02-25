# Employee Leave Management System (ELMS)

A full-stack Employee Leave Management System built with the MERN stack (MongoDB, Express, React, Node.js). This system simulates a real company HR workflow where employees can request leave, and managers/admins can review them.

## 🚀 Features

- **Authentication & Authorization**: Secure login/register using JWT and role-based access control (RBAC).
- **Role-Based Dashboards**:
  - **Employee**: Apply for leave, track leave status.
  - **Manager**: Review (Approve/Reject) leave requests from employees.
  - **Admin**: Full control over users, roles, and system-wide leave requests.
- **Global State Management**: Powered by React Context API.
- **Modern UI**: Built with Tailwind CSS, featuring glassmorphism and responsive design.
- **Real-time Notifications**: Toast notifications for user actions.
- **Analytics**: Visual summary cards for leave statistics.

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router, Axios, Lucide React, React Hot Toast.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB.
- **Security**: JWT (JSON Web Tokens), Bcrypt.js (Password hashing), Cookie-Parser.

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (Running locally or on Atlas)

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd employe-management-system
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/leave-management
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```
### 4. Running the Complete System
From the root directory, you can now use:
```bash
# Run both Frontend and Backend concurrently
npm run dev

# Run only Backend
npm run server

# Run only Frontend
npm run frontend
```

### 5. Manual Setup (Alternative)
#### Backend Setup
```bash
cd server
npm install
npm start
```
#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Credentials for Testing

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | 123456 |
| Manager | manager@example.com | 123456 |
| Employee | employee@example.com | 123456 |

*(Note: You can register new users with these roles using the Registration page)*

## 📂 Project Structure

```
├── frontend
│   ├── src
│   │   ├── components (Reusable UI components)
│   │   ├── context (Auth state management)
│   │   ├── pages (Full page views)
│   │   └── App.jsx (Routing)
├── server
│   ├── config (DB connection)
│   ├── controllers (Business logic)
│   ├── middleware (Auth & role checks)
│   ├── models (MongoDB schemas)
│   └── routes (API endpoints)
```

## 📜 License
MIT
