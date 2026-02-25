const User = require('../models/User');
const Leave = require('../models/Leave');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('managerId', '_id name role department');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get system-wide statistics for Admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalEmployees = await User.countDocuments({ role: 'Employee' });
        const totalManagers = await User.countDocuments({ role: 'Manager' });
        const totalAdmins = await User.countDocuments({ role: 'Admin' });

        const totalLeaves = await Leave.countDocuments();
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });
        const rejectedLeaves = await Leave.countDocuments({ status: 'Rejected' });

        // ── Per-department: employees, managers, total ──────────
        const deptUserStats = await User.aggregate([
            {
                $group: {
                    _id: '$department',
                    total: { $sum: 1 },
                    employees: { $sum: { $cond: [{ $eq: ['$role', 'Employee'] }, 1, 0] } },
                    managers: { $sum: { $cond: [{ $eq: ['$role', 'Manager'] }, 1, 0] } }
                }
            },
            { $sort: { total: -1 } }
        ]);

        // ── Per-department: distinct people currently on leave ──
        // "On leave" = user has at least one Approved leave
        const deptOnLeaveStats = await Leave.aggregate([
            { $match: { status: 'Approved' } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $group: {
                    _id: '$userInfo.department',
                    userIds: { $addToSet: '$user' }   // unique users only
                }
            },
            {
                $project: {
                    onLeave: { $size: '$userIds' }
                }
            }
        ]);

        // Build lookup map: { "CSE": 2, "HR": 1, ... }
        const onLeaveMap = {};
        deptOnLeaveStats.forEach(d => { onLeaveMap[d._id] = d.onLeave; });

        // Merge everything per department
        const departments = deptUserStats.map(d => ({
            name: d._id || 'N/A',
            total: d.total,
            employees: d.employees,
            managers: d.managers,
            onLeave: onLeaveMap[d._id] || 0
        }));

        res.json({
            users: { total: totalUsers, employees: totalEmployees, managers: totalManagers, admins: totalAdmins },
            leaves: { total: totalLeaves, pending: pendingLeaves, approved: approvedLeaves, rejected: rejectedLeaves },
            departments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Update user role/department/managerId
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
    try {
        // Build only the fields that were explicitly sent in the request
        const updateFields = {};

        if (req.body.role !== undefined) updateFields.role = req.body.role;
        if (req.body.department !== undefined) updateFields.department = req.body.department;
        if (req.body.name !== undefined) updateFields.name = req.body.name;

        // managerId: allow null/empty string to CLEAR the assignment
        if (req.body.managerId !== undefined) {
            updateFields.managerId = req.body.managerId || null;
        }

        // Use findByIdAndUpdate so the bcrypt pre-save hook is NOT triggered
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true, runValidators: false }
        ).populate('managerId', '_id name role department');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Credit Salary to User
// @route   POST /api/admin/users/:id/credit-salary
// @access  Private (Admin)
exports.creditSalary = async (req, res) => {
    const { amount } = req.body;
    try {
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ message: 'Please provide a valid positive amount' });
        }

        // Use $inc to atomically add to salaryBalance — does NOT trigger pre-save hook
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $inc: { salaryBalance: Number(amount) } },
            { new: true, runValidators: false }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: `Salary credited. New balance: ${updatedUser.salaryBalance}`,
            balance: updatedUser.salaryBalance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

