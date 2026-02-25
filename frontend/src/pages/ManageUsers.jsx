import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import { toast } from 'react-hot-toast';
import {
    Trash2,
    Search,
    ShieldAlert,
    ShieldCheck,
    Shield,
    IndianRupee,
    PlusCircle,
    UserCircle,
    ChevronDown
} from 'lucide-react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [creditModal, setCreditModal] = useState({ open: false, userId: null, amount: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('/admin/users');
            setUsers(data);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (id, newRole) => {
        try {
            await axios.put(`/admin/users/${id}`, { role: newRole });
            toast.success('User role updated');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const handleUpdateManager = async (userId, managerId) => {
        try {
            // Send empty string as null to clear manager assignment
            await axios.put(`/admin/users/${userId}`, { managerId: managerId || null });
            toast.success(managerId ? 'Manager assigned successfully' : 'Manager removed');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign manager');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`/admin/users/${id}`);
                toast.success('User deleted');
                fetchUsers();
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    const handleCreditSalary = async () => {
        if (!creditModal.amount || isNaN(creditModal.amount)) {
            return toast.error('Enter a valid amount');
        }
        try {
            await axios.post(`/admin/users/${creditModal.userId}/credit-salary`, { amount: creditModal.amount });
            toast.success('Salary credited successfully!');
            setCreditModal({ open: false, userId: null, amount: '' });
            fetchUsers();
        } catch (error) {
            toast.error('Failed to credit salary');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const managers = users.filter(u => u.role === 'Manager' || u.role === 'Admin');

    const RoleBadge = ({ role }) => {
        const styles = {
            Admin: "bg-purple-100 text-purple-700 border-purple-200",
            Manager: "bg-blue-100 text-blue-700 border-blue-200",
            Employee: "bg-gray-100 text-gray-700 border-gray-200"
        };
        const Icons = {
            Admin: <ShieldAlert className="w-3 h-3 mr-1" />,
            Manager: <ShieldCheck className="w-3 h-3 mr-1" />,
            Employee: <Shield className="w-3 h-3 mr-1" />
        };
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border ${styles[role]}`}>
                {Icons[role]}{role}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <div className="p-4 sm:p-8">
                <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Manage Users</h1>
                        <p className="text-gray-500 mt-1 text-sm">Control user access, roles, and hierarchy</p>
                    </div>
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Search className="h-5 w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto min-w-full">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-[10px] sm:text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4">User</th>
                                    <th className="px-4 sm:px-6 py-4">Reporting To</th>
                                    <th className="px-4 sm:px-6 py-4 hidden sm:table-cell">Role</th>
                                    <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm sm:text-base">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="ml-3 sm:ml-4 min-w-0">
                                                    <div className="text-sm font-semibold text-gray-800 truncate">{user.name}</div>
                                                    <div className="text-[10px] sm:text-xs text-gray-500 truncate">{user.email}</div>
                                                    <div className="sm:hidden mt-0.5"><RoleBadge role={user.role} /></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            {user.role === 'Admin' ? (
                                                <span className="text-xs text-gray-400 italic">Self-Managed</span>
                                            ) : (
                                                <div className="space-y-1">
                                                    <div className="relative inline-block w-full max-w-[180px]">
                                                        <select
                                                            className="block w-full pl-3 pr-8 py-2 text-xs border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none font-medium"
                                                            value={
                                                                // managerId may be a populated object or a raw ID string
                                                                typeof user.managerId === 'object' && user.managerId !== null
                                                                    ? user.managerId._id
                                                                    : user.managerId || ''
                                                            }
                                                            onChange={(e) => handleUpdateManager(user._id, e.target.value)}
                                                        >
                                                            <option value="">— No Manager —</option>
                                                            {managers
                                                                .filter(m => m._id !== user._id)
                                                                .map(m => (
                                                                    <option key={m._id} value={m._id}>
                                                                        {m.name} ({m.department})
                                                                    </option>
                                                                ))
                                                            }
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                                            <ChevronDown className="w-3 h-3" />
                                                        </div>
                                                    </div>
                                                    {user.managerId && (
                                                        <p className="text-[10px] text-emerald-600 font-medium px-1">
                                                            ✓ Assigned to {typeof user.managerId === 'object' ? user.managerId.name : 'a manager'}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-right space-x-1 sm:space-x-2">
                                            <button
                                                onClick={() => setCreditModal({ open: true, userId: user._id, amount: '' })}
                                                className="p-1.5 sm:p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-flex align-middle"
                                                title="Credit Salary"
                                            >
                                                <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            </button>
                                            <select
                                                className="text-[10px] sm:text-xs bg-gray-50 border border-gray-200 rounded-lg p-1 sm:p-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[100px]"
                                                value={user.role}
                                                onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                            >
                                                <option value="Employee">Employee</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex align-middle"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Credit Salary Modal */}
            {creditModal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl scale-in transform transition-all">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                <PlusCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Credit Salary</h3>
                        </div>
                        <p className="text-gray-500 text-sm mb-6 font-medium">Enter amount to credit to user account.</p>
                        <div className="relative mb-6">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input
                                type="number"
                                className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-bold text-lg"
                                placeholder="0.00"
                                value={creditModal.amount}
                                onChange={(e) => setCreditModal({ ...creditModal, amount: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setCreditModal({ open: false, userId: null, amount: '' })}
                                className="py-3 px-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreditSalary}
                                className="py-3 px-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
                            >
                                Credit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ManageUsers;
