require("dotenv").config(); // 🔥 ALWAYS FIRST
require("dns").setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const adminRoutes = require("./routes/adminRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const reimbursementRoutes = require("./routes/reimbursementRoutes");

const app = express();

console.log("URI:", process.env.MONGODB_URI);

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from any localhost port (Vite can use 5173 or 5174+)
    const allowed = !origin || /^http:\/\/localhost:\d+$/.test(origin);
    callback(null, allowed ? origin : false);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/reimbursements", reimbursementRoutes);

app.get("/", (req, res) => {
  res.send("Employee Leave Management System API");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// require('dns').setDefaultResultOrder('ipv4first');
// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const cookieParser = require('cookie-parser');
// const connectDB = require('./config/db');
// require("dns").setDefaultResultOrder("ipv4first");
// // Routes
// const authRoutes = require('./routes/authRoutes');
// const leaveRoutes = require('./routes/leaveRoutes');
// const adminRoutes = require('./routes/adminRoutes');

// dotenv.config();

// const app = express();
// console.log(process.env.MONGODB_URI);
// // Connect to Database
// connectDB();

// // Middleware
// app.use(cors({
//   origin: 'http://localhost:5173', // Vite default port
//   credentials: true
// }));
// app.use(express.json());
// app.use(cookieParser());

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/leaves', leaveRoutes);
// app.use('/api/admin', adminRoutes);

// app.get('/', (req, res) => {
//   res.send('Employee Leave Management System API');
// });

// console.log("URI:", process.env.MONGODB_URI);
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
