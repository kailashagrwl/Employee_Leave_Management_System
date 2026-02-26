const Reimbursement = require('../models/Reimbursement');
const ReimbursementCategory = require('../models/ReimbursementCategory');
const User = require('../models/User');

// @desc    Apply for reimbursement
// @route   POST /api/reimbursements/apply
// @access  Private (Employee)
exports.applyReimbursement = async (req, res) => {
    try {
        const { category, amount, description, fromDate, toDate } = req.body;

        // Receipt URL if file uploaded
        const receiptUrl = req.file ? `/uploads/${req.file.filename}` : '';

        const reimbursement = await Reimbursement.create({
            employeeId: req.user._id,
            category,
            amount,
            description,
            fromDate,
            toDate,
            receiptUrl,
            status: 'Pending'
        });

        res.status(201).json(reimbursement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get my reimbursements
// @route   GET /api/reimbursements/my
// @access  Private (Employee)
exports.getMyReimbursements = async (req, res) => {
    try {
        const reimbursements = await Reimbursement.find({ employeeId: req.user._id })
            .populate('employeeId', 'name email department role')
            .sort({ createdAt: -1 });
        res.json(reimbursements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get team reimbursements (for Manager)
// @route   GET /api/reimbursements/team
// @access  Private (Manager)
exports.getTeamReimbursements = async (req, res) => {
    try {
        // Find users in the same department, EXCLUDING the manager themselves
        const teamUsers = await User.find({
            department: req.user.department,
            _id: { $ne: req.user._id }
        }).select('_id');
        const teamUserIds = teamUsers.map(u => u._id);

        const reimbursements = await Reimbursement.find({ employeeId: { $in: teamUserIds } })
            .populate('employeeId', 'name email department role')
            .sort({ createdAt: -1 });

        res.json(reimbursements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reimbursements (for Admin)
// @route   GET /api/reimbursements
// @access  Private (Admin)
exports.getAllReimbursements = async (req, res) => {
    try {
        const reimbursements = await Reimbursement.find()
            .populate('employeeId', 'name email department role')
            .sort({ createdAt: -1 });
        res.json(reimbursements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Process reimbursement (Approve/Reject)
// @route   PATCH /api/reimbursements/:id/action
// @access  Private (Manager/Admin)
exports.updateReimbursementAction = async (req, res) => {
    try {
        const { status, remark } = req.body;
        const reimbursement = await Reimbursement.findById(req.params.id).populate('employeeId', 'role');

        if (!reimbursement) {
            return res.status(404).json({ message: 'Reimbursement not found' });
        }

        // Security Check: Users cannot approve their own requests
        if (reimbursement.employeeId._id.toString() === req.user._id.toString()) {
            return res.status(403).json({ message: 'You cannot review your own reimbursement request' });
        }

        // Security Check: Manager requests can ONLY be reviewed by Admins
        if (reimbursement.employeeId.role === 'Manager' && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Manager requests can only be reviewed by an Admin' });
        }

        // Security Check: Manager cannot override rejection to approve it (only Admin can)
        if (reimbursement.status === 'Rejected' && status === 'Approved' && req.user.role !== 'Admin') {
            return res.status(403).json({ 
                message: 'Only administrators can approve previously rejected reimbursements' 
            });
        }

        if (req.user.role === 'Admin') {
            reimbursement.status = status;
            reimbursement.adminRemark = remark;
        } else if (req.user.role === 'Manager') {
            reimbursement.status = status;
            reimbursement.managerRemark = remark;
        }

        await reimbursement.save();
        res.json(reimbursement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get Admin analytics
// @route   GET /api/reimbursements/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
    try {
        const stats = await Reimbursement.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    approvedAmount: {
                        $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, '$amount', 0] }
                    },
                    pendingAmount: {
                        $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, '$amount', 0] }
                    }
                }
            }
        ]);

        const categoryStats = await Reimbursement.aggregate([
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            overview: stats[0] || { totalAmount: 0, approvedAmount: 0, pendingAmount: 0 },
            categories: categoryStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ─────────────────────────────────────────────────────
   CATEGORY MANAGEMENT
───────────────────────────────────────────────────── */

// @desc    Get all categories
// @route   GET /api/reimbursements/categories
// @access  Private (Any logged in user)
exports.getCategories = async (req, res) => {
    try {
        const categories = await ReimbursementCategory.find({ isActive: true });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all categories (with inactive ones, for admin)
// @route   GET /api/reimbursements/admin/categories
// @access  Private (Admin)
exports.getAdminCategories = async (req, res) => {
    try {
        const categories = await ReimbursementCategory.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create category
// @route   POST /api/reimbursements/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
    try {
        const category = await ReimbursementCategory.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update category
// @route   PATCH /api/reimbursements/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res) => {
    try {
        const category = await ReimbursementCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
