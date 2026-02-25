const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser, creditSalary, getSystemStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Admin Dashboard stats
router.get('/stats', authorize('Admin'), getSystemStats);

// Admin only User Management
router.get('/users', authorize('Admin'), getUsers);
router.route('/users/:id')
    .put(authorize('Admin'), updateUser)
    .delete(authorize('Admin'), deleteUser);

// Credit Salary - Admin only (removed Manager to keep security tight)
router.post('/users/:id/credit-salary', authorize('Admin'), creditSalary);

module.exports = router;
