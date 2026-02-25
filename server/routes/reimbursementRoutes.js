const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize, isAdmin, isManager } = require('../middleware/authMiddleware');
const {
    applyReimbursement,
    getMyReimbursements,
    getTeamReimbursements,
    getAllReimbursements,
    updateReimbursementAction,
    getAdminStats,
    getCategories,
    getAdminCategories,
    createCategory,
    updateCategory
} = require('../controllers/reimbursementController');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Storage Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Category Routes (Publicly accessible for dropdowns once logged in)
router.get('/categories', protect, getCategories);

// Employee Routes
router.post('/apply', protect, upload.single('receipt'), applyReimbursement);
router.get('/my', protect, getMyReimbursements);

// Manager Routes
router.get('/team', protect, isManager, getTeamReimbursements);
router.patch('/:id/action', protect, authorize('Manager', 'Admin'), updateReimbursementAction);

// Admin Routes
router.get('/', protect, isAdmin, getAllReimbursements);
router.get('/admin/stats', protect, isAdmin, getAdminStats);
router.get('/admin/categories', protect, isAdmin, getAdminCategories);
router.post('/categories', protect, isAdmin, createCategory);
router.patch('/categories/:id', protect, isAdmin, updateCategory);

module.exports = router;
