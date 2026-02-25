import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    Receipt, Plus, History, Filter, CheckCircle2, XCircle, X,
    Clock, MoreVertical, Paperclip, AlertCircle, Download,
    Send, Loader2, BarChart3, PieChart as PieIcon, Settings,
    Trash2, Edit3, ChevronRight, TrendingUp, IndianRupee, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

/* ─────────────────────────────────────────────────────
   Reusable Components
───────────────────────────────────────────────────── */
const StatCard = ({ title, value, color, icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className={`p-4 rounded-xl bg-${color}-50 text-${color}-600`}>{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const config = {
        Pending: 'bg-amber-50 text-amber-700 border-amber-100',
        Approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        Rejected: 'bg-rose-50 text-rose-700 border-rose-100'
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config[status]}`}>
            {status}
        </span>
    );
};

/* ─────────────────────────────────────────────────────
   Main Module
───────────────────────────────────────────────────── */
const Reimbursements = () => {
    const { user } = useAuth();
    const [view, setView] = useState('list'); // 'list', 'apply', 'admin-cats', 'analytics'
    const [listType, setListType] = useState(user?.role === 'Employee' ? 'personal' : 'team'); // 'team' or 'personal'
    const [reimbursements, setReimbursements] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [catFilter, setCatFilter] = useState('All');

    // Forms
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        description: '',
        fromDate: '',
        toDate: ''
    });
    const [file, setFile] = useState(null);

    // Modal / Action State
    const [selectedItem, setSelectedItem] = useState(null);
    const [actionModal, setActionModal] = useState(false);
    const [actionData, setActionData] = useState({ status: 'Approved', remark: '' });

    // Category Management
    const [showCatModal, setShowCatModal] = useState(false);
    const [editingCat, setEditingCat] = useState(null);
    const [catForm, setCatForm] = useState({ name: '', maxLimit: '', requiresReceipt: true });

    useEffect(() => {
        fetchData();
        fetchCategories();
        if (user.role === 'Admin') fetchStats();
    }, [view, user.role, listType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let res;
            if (user.role === 'Admin') {
                res = await axios.get('/reimbursements');
            } else if (user.role === 'Manager') {
                res = listType === 'team' ? await axios.get('/reimbursements/team') : await axios.get('/reimbursements/my');
            } else {
                res = await axios.get('/reimbursements/my');
            }
            setReimbursements(res.data);
        } catch (error) {
            toast.error('Failed to load reimbursements');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(user.role === 'Admin' ? '/reimbursements/admin/categories' : '/reimbursements/categories');
            setCategories(res.data);
            if (res.data.length > 0 && !formData.category) {
                setFormData(prev => ({ ...prev, category: res.data[0].name }));
            }
        } catch (error) {
            console.error('Failed to load categories');
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('/reimbursements/admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error('Failed to load stats');
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (file) data.append('receipt', file);

        try {
            await axios.post('/reimbursements/apply', data);
            toast.success('Application submitted successfully!');
            setView('list');
            fetchData();
            setFormData({ category: categories[0]?.name || '', amount: '', description: '', fromDate: '', toDate: '' });
            setFile(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const openReviewModal = (item) => {
        setSelectedItem(item);
        setActionData({ status: 'Approved', remark: '' });
        setActionModal(true);
    };

    const handleAction = async () => {
        setSubmitting(true);
        try {
            await axios.patch(`/reimbursements/${selectedItem._id}/action`, actionData);
            toast.success(`Claim ${actionData.status} Successfully`);
            setActionModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCatSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCat) {
                await axios.patch(`/reimbursements/categories/${editingCat._id}`, catForm);
                toast.success('Category updated');
            } else {
                await axios.post('/reimbursements/categories', catForm);
                toast.success('Category created');
            }
            setShowCatModal(false);
            fetchCategories();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const filteredReimbursements = reimbursements.filter(item => {
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        const matchesCat = catFilter === 'All' || item.category === catFilter;
        return matchesStatus && matchesCat;
    });

    return (
        <DashboardLayout>
            <div className="p-4 sm:p-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight flex items-center">
                            <Receipt className="w-8 h-8 mr-3 text-emerald-600" />
                            Reimbursement Management
                        </h1>
                        <p className="text-gray-500 mt-1">Manage and track your expense claims effortlessly</p>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                        <button onClick={() => setView('list')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${view === 'list' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}>
                            Overview
                        </button>
                        {(user.role === 'Employee' || user.role === 'Manager') && (
                            <button onClick={() => setView('apply')}
                                className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center whitespace-nowrap">
                                <Plus className="w-4 h-4 mr-1" /> New Claim
                            </button>
                        )}
                        {user.role === 'Admin' && (
                            <>
                                <button onClick={() => setView('analytics')}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${view === 'analytics' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}>
                                    Analytics
                                </button>
                                <button onClick={() => setView('admin-cats')}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${view === 'admin-cats' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}>
                                    Categories
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                {view === 'list' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Highlights (Optional integration) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatCard title="Total Claims" value={reimbursements.length} color="blue" icon={<History className="w-6 h-6" />} />
                            <StatCard title="Approved Amount" value={`₹${reimbursements.reduce((sum, i) => i.status === 'Approved' ? sum + i.amount : sum, 0).toLocaleString()}`} color="emerald" icon={<CheckCircle2 className="w-6 h-6" />} />
                            <StatCard title="Pending" value={reimbursements.filter(i => i.status === 'Pending').length} color="amber" icon={<Clock className="w-6 h-6" />} />
                        </div>

                        {/* List Section */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            {user.role === 'Manager' && (
                                <div className="flex border-b border-gray-50">
                                    <button
                                        onClick={() => setListType('team')}
                                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${listType === 'team' ? 'text-emerald-600 bg-emerald-50/30' : 'text-gray-400 hover:text-gray-600'}`}>
                                        Team Claims
                                    </button>
                                    <button
                                        onClick={() => setListType('personal')}
                                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${listType === 'personal' ? 'text-emerald-600 bg-emerald-50/30' : 'text-gray-400 hover:text-gray-600'}`}>
                                        My Claims
                                    </button>
                                </div>
                            )}
                            <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h3 className="font-bold text-gray-800 flex items-center">
                                    <Filter className="w-4 h-4 mr-2 text-emerald-600" />
                                    {user.role === 'Admin' ? 'Overall Company Claims' : (listType === 'team' ? 'Team Requests' : 'My Personal Claims')}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                                        className="text-xs font-bold bg-gray-50 border-none rounded-xl px-4 py-2 text-gray-600 focus:ring-0">
                                        <option value="All">All Categories</option>
                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </select>
                                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                        className="text-xs font-bold bg-gray-50 border-none rounded-xl px-4 py-2 text-gray-600 focus:ring-0">
                                        <option value="All">All Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Employee & Details</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-center">Receipt</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredReimbursements.map(item => (
                                            <tr key={item._id} className="hover:bg-gray-50 transition-all group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        {(user.role === 'Admin' || user.role === 'Manager') ? (
                                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs uppercase">
                                                                {item.employeeId?.name?.charAt(0) || 'U'}
                                                            </div>
                                                        ) : null}
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800 tracking-tight">{item.employeeId?.name || 'Self'}</p>
                                                            <p className="text-[10px] text-gray-400 font-medium">{new Date(item.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-black text-gray-700 text-sm">₹{item.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                                                <td className="px-6 py-4 text-center text-gray-400">
                                                    {item.receiptUrl ? (
                                                        <a href={`http://localhost:5000${item.receiptUrl}`} target="_blank" rel="noreferrer"
                                                            className="p-2 hover:bg-emerald-50 hover:text-emerald-600 transition-colors inline-block rounded-lg">
                                                            <Paperclip className="w-5 h-5" />
                                                        </a>
                                                    ) : <span className="text-[10px] italic">No receipt</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {(user.role === 'Admin' || (user.role === 'Manager' && item.employeeId?._id !== user._id && item.employeeId?.role !== 'Manager')) && item.status === 'Pending' ? (
                                                        <button
                                                            onClick={() => openReviewModal(item)}
                                                            className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm active:scale-95">
                                                            Review
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => toast.info(item.managerRemark || item.adminRemark || 'No remarks provided')} className="p-2 text-gray-400 hover:text-gray-600"><AlertCircle className="w-5 h-5" /></button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredReimbursements.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-20 text-center opacity-40 italic font-medium text-gray-400">
                                                    No reimbursement claims found match the criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'apply' && (
                    <div className="max-w-2xl mx-auto animate-slide-up">
                        <section className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                            <div className="p-8 bg-emerald-600 text-white relative flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">Apply Claim</h2>
                                    <p className="text-emerald-100 text-sm mt-1">Submit details for expense reimbursement</p>
                                </div>
                                <div className="absolute top-[-20px] right-[-20px] bg-white/10 w-40 h-40 rounded-full"></div>
                                <Receipt className="w-12 h-12 text-emerald-300 opacity-50 relative z-10" />
                            </div>
                            <form onSubmit={handleApply} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Expense Category</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-800 transition-all">
                                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Amount (₹)</label>
                                        <input
                                            type="number" required placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-black text-gray-800 text-lg transition-all" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">From Date (Optional)</label>
                                        <input
                                            type="date"
                                            value={formData.fromDate}
                                            onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-700 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">To Date (Optional)</label>
                                        <input
                                            type="date"
                                            value={formData.toDate}
                                            onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-700 transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Description / Notes</label>
                                    <textarea
                                        rows="3" required placeholder="Describe your expense..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-medium text-gray-800 transition-all"></textarea>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Upload Receipt (Max 5MB)</label>
                                    <div className="relative group">
                                        <input
                                            type="file" accept="image/*,application/pdf"
                                            onChange={(e) => setFile(e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 flex flex-col items-center justify-center transition-all group-hover:bg-emerald-50 group-hover:border-emerald-200">
                                            <Paperclip className={`w-8 h-8 ${file ? 'text-emerald-600' : 'text-gray-300'} mb-2`} />
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{file ? file.name : 'Choose File or Drag & Drop'}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit" disabled={submitting}
                                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center">
                                    {submitting ? <Loader2 className="animate-spin w-6 h-6" /> : 'Submit Application'}
                                </button>
                            </form>
                        </section>
                    </div>
                )}

                {view === 'analytics' && stats && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="Total Requested" value={`₹${stats.overview.totalAmount.toLocaleString()}`} color="blue" icon={<TrendingUp className="w-6 h-6" />} />
                            <StatCard title="Approved Claims" value={`₹${stats.overview.approvedAmount.toLocaleString()}`} color="emerald" icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />} />
                            <StatCard title="Pending Review" value={`₹${stats.overview.pendingAmount.toLocaleString()}`} color="amber" icon={<AlertCircle className="w-6 h-6" />} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Category-wise Spending</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.categories}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                                            <Bar dataKey="total" fill="#059669" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Top Spend Origins</h3>
                                <div className="h-[250px] relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.categories} cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                                                paddingAngle={5} dataKey="total" nameKey="_id">
                                                {stats.categories.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4 px-4">
                                    {stats.categories.map((c, i) => (
                                        <div key={i} className="flex items-center space-x-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5] }}></div>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{c._id}: ₹{c.total.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'admin-cats' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="font-bold text-gray-800 flex items-center"><Settings className="w-5 h-5 mr-3 text-emerald-600" />Category Settings</h3>
                                <button
                                    onClick={() => { setEditingCat(null); setCatForm({ name: '', maxLimit: '', requiresReceipt: true }); setShowCatModal(true); }}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Category
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4 text-center">#</th>
                                            <th className="px-6 py-4">Category Name</th>
                                            <th className="px-6 py-4">Receipt Required</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {categories.map((c, idx) => (
                                            <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-center text-xs font-bold text-gray-300">{idx + 1}</td>
                                                <td className="px-6 py-4 font-bold text-gray-700">{c.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${c.requiresReceipt ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-gray-100 text-gray-400'}`}>
                                                        {c.requiresReceipt ? 'Required' : 'Optional'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`w-2 h-2 rounded-full inline-block mr-2 ${c.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-300'}`}></span>
                                                    <span className="text-[10px] font-bold text-gray-600 uppercase">{c.isActive ? 'Active' : 'Disabled'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end space-x-1">
                                                        <button
                                                            onClick={() => { setEditingCat(c); setCatForm({ name: c.name, maxLimit: c.maxLimit || '', requiresReceipt: c.requiresReceipt }); setShowCatModal(true); }}
                                                            className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm('Toggle status?')) {
                                                                    await axios.patch(`/reimbursements/categories/${c._id}`, { isActive: !c.isActive });
                                                                    fetchCategories();
                                                                }
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─────────────────────────────────────────────────────
               MODALS
            ───────────────────────────────────────────────────── */}

            {/* Action/Approval Modal */}
            {actionModal && selectedItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-fade-in text-gray-800">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 max-w-md w-full relative overflow-hidden">
                        <button onClick={() => setActionModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
                        <h3 className="text-xl font-black mb-1">Process Claim</h3>
                        <p className="text-sm text-gray-500 mb-6">Review expense claim for {selectedItem.employeeId?.name}</p>

                        <div className="bg-gray-50 p-4 rounded-2xl mb-6 space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-gray-400 uppercase font-black text-[10px]">Requested</span><span className="font-black text-emerald-600">₹{selectedItem.amount.toLocaleString()}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-400 uppercase font-black text-[10px]">Category</span><span className="font-bold text-gray-700">{selectedItem.category}</span></div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setActionData({ ...actionData, status: 'Approved' })}
                                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center ${actionData.status === 'Approved' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md' : 'border-gray-100 text-gray-400'}`}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Accept
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActionData({ ...actionData, status: 'Rejected' })}
                                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center ${actionData.status === 'Rejected' ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-md' : 'border-gray-100 text-gray-400'}`}>
                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                </button>
                            </div>
                            <textarea
                                placeholder="Add remark or reason for this decision (optional)..."
                                value={actionData.remark}
                                onChange={(e) => setActionData({ ...actionData, remark: e.target.value })}
                                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium h-24 transition-all"></textarea>
                            <button
                                onClick={handleAction}
                                disabled={submitting}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl disabled:opacity-50 flex justify-center items-center ${actionData.status === 'Approved' ? 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700' : 'bg-rose-600 text-white shadow-rose-100 hover:bg-rose-700'
                                    }`}>
                                {submitting ? <Loader2 className="animate-spin w-6 h-6" /> : `Confirm ${actionData.status === 'Approved' ? 'Approval' : 'Rejection'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Update Modal */}
            {showCatModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-fade-in text-gray-800">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 max-w-sm w-full relative">
                        <button onClick={() => setShowCatModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        <h3 className="text-xl font-black mb-6">{editingCat ? 'Edit Category' : 'New Category'}</h3>
                        <form onSubmit={handleCatSubmit} className="space-y-4">
                            <input
                                type="text" placeholder="Category Name" required
                                value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold" />
                            <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox" checked={catForm.requiresReceipt} onChange={(e) => setCatForm({ ...catForm, requiresReceipt: e.target.checked })}
                                    className="w-5 h-5 text-emerald-600 rounded-lg focus:ring-0 cursor-pointer" />
                                <span className="text-sm font-bold text-gray-600">Requires Receipt</span>
                            </label>
                            <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-50 mt-4">
                                {editingCat ? 'Update Category' : 'Create Category'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Reimbursements;
