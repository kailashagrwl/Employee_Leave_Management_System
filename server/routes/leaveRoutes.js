const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getMyLeaves,
    getLeaves,
    updateLeaveStatus,
    getLeaveStats,
    cancelLeave
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Self-service routes
router.post('/', applyLeave); // POST /api/leaves
router.post('/apply', applyLeave); // POST /api/leaves/apply (requested)
router.get('/my-leaves', getMyLeaves); // Existing
router.get('/my', getMyLeaves); // requested GET /api/leaves/my
router.get('/stats', getLeaveStats);
router.patch('/:id/cancel', cancelLeave); // requested PATCH /api/leaves/:id/cancel

// Team Management routes
router.get('/', authorize('Manager', 'Admin'), getLeaves); // Existing
router.get('/team', authorize('Manager', 'Admin'), getLeaves); // requested GET /api/leaves/team

// Status updates
router.put('/:id', authorize('Manager', 'Admin'), updateLeaveStatus); // Existing
router.patch('/:id/approve', authorize('Manager', 'Admin'), (req, res) => {
    req.body.status = 'Approved';
    updateLeaveStatus(req, res);
}); // requested PATCH /api/leaves/:id/approve
router.patch('/:id/reject', authorize('Manager', 'Admin'), (req, res) => {
    req.body.status = 'Rejected';
    updateLeaveStatus(req, res);
}); // requested PATCH /api/leaves/:id/reject

module.exports = router;
