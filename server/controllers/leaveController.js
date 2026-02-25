const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Employee, Manager, Admin)
exports.applyLeave = async (req, res) => {
    const { leaveType, startDate, endDate, reason } = req.body;

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        if (days <= 0) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        // Check balance
        let balance = await LeaveBalance.findOne({ userId: req.user.id });
        if (!balance) {
            balance = await LeaveBalance.create({ userId: req.user.id });
        }

        const typeMap = {
            'Sick Leave': 'sickLeave',
            'Casual Leave': 'casualLeave',
            'Annual Leave': 'annualLeave',
            'Maternity Leave': 'maternityLeave',
            'Paternity Leave': 'paternityLeave'
        };

        const balanceField = typeMap[leaveType];
        if (balanceField && balance[balanceField] < days) {
            return res.status(400).json({ message: `Insufficient ${leaveType} balance. Available: ${balance[balanceField]}` });
        }

        const leave = await Leave.create({
            user: req.user.id,
            leaveType,
            startDate,
            endDate,
            days,
            reason
        });

        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's leaves (Self-service)
// @route   GET /api/leaves/my-leaves
// @access  Private
exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ user: req.user.id }).sort('-appliedAt');
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel a pending leave (Self-service)
// @route   PATCH /api/leaves/:id/cancel
// @access  Private
exports.cancelLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (leave.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'You can only cancel your own leaves' });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending leaves can be cancelled' });
        }

        await leave.deleteOne();
        res.json({ message: 'Leave request cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get leave requests for approval (Team Management)
// @route   GET /api/leaves
// @access  Private (Manager, Admin)
exports.getLeaves = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'Manager') {
            // Get the manager's own department
            const manager = await User.findById(req.user.id);
            if (!manager) return res.status(404).json({ message: 'Manager not found' });

            // Find all employees in the same department, excluding the manager themselves
            const deptMembers = await User.find({
                department: manager.department,
                _id: { $ne: manager._id },
                role: { $in: ['Employee', 'Manager'] } // include other dept staff too
            }).select('_id');

            const memberIds = deptMembers.map(m => m._id);
            query = { user: { $in: memberIds } };
        } else if (req.user.role === 'Admin') {
            // Admins see everything
            query = {};
        } else {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const leaves = await Leave.find(query)
            .populate('user', 'name email department role managerId')
            .sort('-appliedAt');

        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/leaves/:id
// @access  Private (Manager, Admin)
exports.updateLeaveStatus = async (req, res) => {
    const { status, reviewComment } = req.body;

    try {
        let leave = await Leave.findById(req.params.id).populate('user');

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Security Checks
        if (leave.user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'You cannot approve your own leave request' });
        }

        if (req.user.role === 'Manager') {
            // Manager can only approve/reject employees in the SAME department
            const manager = await User.findById(req.user.id);
            if (!manager) return res.status(403).json({ message: 'Manager not found' });

            if (leave.user.department !== manager.department) {
                return res.status(403).json({
                    message: `You can only manage leaves for employees in the ${manager.department} department`
                });
            }
        }

        // If approving, deduct from balance
        if (status === 'Approved' && leave.status !== 'Approved') {
            const typeMap = {
                'Sick Leave': 'sickLeave',
                'Casual Leave': 'casualLeave',
                'Annual Leave': 'annualLeave',
                'Maternity Leave': 'maternityLeave',
                'Paternity Leave': 'paternityLeave'
            };
            const balanceField = typeMap[leave.leaveType];

            if (balanceField) {
                const balance = await LeaveBalance.findOne({ userId: leave.user._id });
                if (balance) {
                    balance[balanceField] -= leave.days;
                    await balance.save();
                }
            }
        }

        leave.status = status;
        leave.reviewComment = reviewComment;
        leave.reviewedBy = req.user.id;

        await leave.save();

        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get leave statistics
// @route   GET /api/leaves/stats
// @access  Private
exports.getLeaveStats = async (req, res) => {
    try {
        let query = {};
        // For Dashboard stats, we usually want personal stats for everyone unless it's a specific admin view
        // But the current Dashboard layout for Employee/Manager uses these for personal quotas
        if (req.user.role !== 'Admin') {
            query.user = req.user._id;
        }

        const stats = await Leave.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: '$days' } // Sum the actual days instead of request counts
                }
            }
        ]);

        const formattedStats = {
            Pending: 0,
            Approved: 0,
            Rejected: 0,
            Total: 0,
            Remaining: 0
        };

        stats.forEach(item => {
            formattedStats[item._id] = item.count;
            formattedStats.Total += item.count;
        });

        // Get remaining leaves from balance
        if (req.user.role === 'Employee' || req.user.role === 'Manager') {
            let balance = await LeaveBalance.findOne({ userId: req.user.id });
            if (!balance) {
                balance = await LeaveBalance.create({ userId: req.user.id });
            }
            formattedStats.Remaining = balance.sickLeave + balance.casualLeave + balance.annualLeave + balance.maternityLeave + balance.paternityLeave;
            formattedStats.initialTotal = 12 + 10 + 15 + 90 + 15; // Sum of defaults
        }

        res.json(formattedStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
