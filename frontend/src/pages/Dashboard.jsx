import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    CheckCircle2, XCircle, BarChart3, CalendarDays, Briefcase,
    TrendingUp, Wallet, MessageSquare, X, Users, ShieldCheck,
    ShieldAlert, UserCircle, Activity, Clock, Globe, ChevronRight,
    CalendarCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ─────────────────────────────────────────────────────
   Shared sub-components
───────────────────────────────────────────────────── */
const StatCard = ({ title, value, color, icon, sub }) => (
    <div className="p-5 sm:p-6 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 shrink-0`}>{icon}</div>
        <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
            {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const map = {
        Approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        Rejected: 'bg-red-50 text-red-700 border-red-100',
        Pending: 'bg-amber-50 text-amber-700 border-amber-100'
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[status]}`}>
            {status}
        </span>
    );
};

const SectionHeader = ({ icon, title, badge }) => (
    <div className="flex items-center space-x-3">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">{icon}</div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        {badge !== undefined && (
            <span className="ml-auto bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold">{badge}</span>
        )}
    </div>
);

/* ─────────────────────────────────────────────────────
   EMPLOYEE PAGE
───────────────────────────────────────────────────── */
const EmployeeDashboard = ({ stats, myLeaves, holidays, handleCancel }) => (
    <>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Quota" value={stats.initialTotal || '--'} color="blue" icon={<BarChart3 className="w-5 h-5" />} />
            <StatCard title="Used Leaves" value={stats.Approved} color="emerald" icon={<CheckCircle2 className="w-5 h-5" />} />
            <StatCard title="Remaining" value={stats.Remaining} color="sky" icon={<TrendingUp className="w-5 h-5" />} />
            <StatCard title="Rejected" value={stats.Rejected} color="red" icon={<XCircle className="w-5 h-5" />} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
                <SectionHeader icon={<Briefcase className="w-5 h-5" />} title="My Leave History" />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] sm:text-xs uppercase font-semibold text-gray-400">
                        <tr>
                            <th className="px-5 py-4">Leave Type & Dates</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4 text-right">Days / Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {myLeaves.map(leave => (
                            <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-4">
                                    <p className="text-sm font-bold text-gray-800">{leave.leaveType}</p>
                                    <p className="text-[10px] text-gray-400">
                                        {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="px-5 py-4">
                                    <StatusBadge status={leave.status} />
                                    {leave.reviewComment && (
                                        <p className="text-[10px] italic text-gray-400 mt-1 max-w-[140px] truncate">"{leave.reviewComment}"</p>
                                    )}
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <p className="text-sm font-bold text-gray-500">{leave.days}d</p>
                                    {leave.status === 'Pending' && (
                                        <button onClick={() => handleCancel(leave._id)}
                                            className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center ml-auto mt-1">
                                            <X className="w-3 h-3 mr-1" />Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {myLeaves.length === 0 && (
                            <tr><td colSpan="3" className="px-5 py-12 text-center text-gray-400 italic">No leave records found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </>
);

/* ─────────────────────────────────────────────────────
   MANAGER PAGE
───────────────────────────────────────────────────── */
const ManagerDashboard = ({ stats, myLeaves, allLeaves, holidays, handleCancel, handleReviewClick, managerDept }) => {
    const [teamFilter, setTeamFilter] = useState('Pending');

    return (
        <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="My Quota" value={stats.initialTotal || '--'} color="blue" icon={<BarChart3 className="w-5 h-5" />} />
                <StatCard title="My Leaves Left" value={stats.Remaining} color="emerald" icon={<TrendingUp className="w-5 h-5" />} />
                <StatCard title="Dept. Pending" value={allLeaves.filter(l => l.status === 'Pending').length} color="amber" icon={<Clock className="w-5 h-5" />} sub={managerDept ? `${managerDept} Dept.` : undefined} />
                <StatCard title="Dept. Approved" value={allLeaves.filter(l => l.status === 'Approved').length} color="sky" icon={<CheckCircle2 className="w-5 h-5" />} sub={managerDept ? `${managerDept} Dept.` : undefined} />
            </div>

            {/* Section 2: Team Leave Requests */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <SectionHeader
                            icon={<Users className="w-5 h-5" />}
                            title={managerDept ? `${managerDept} Department — Leave Requests` : 'Team Leave Requests'}
                            badge={`${allLeaves.filter(l => l.status === 'Pending').length} Pending`}
                        />
                    </div>
                    <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                        {['Pending', 'Approved', 'Rejected'].map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setTeamFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${teamFilter === s
                                    ? 'bg-white text-emerald-600 shadow-sm border border-gray-100'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] sm:text-xs uppercase font-semibold text-gray-400">
                            <tr>
                                <th className="px-5 py-4">Employee</th>
                                <th className="px-5 py-4 hidden sm:table-cell">Leave</th>
                                <th className="px-5 py-4">Days</th>
                                <th className="px-5 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {allLeaves.filter(l => l.status === teamFilter).map(leave => (
                                <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-bold text-gray-800">{leave.user?.name}</p>
                                        <p className="text-[10px] text-gray-400">{leave.user?.department}</p>
                                        {leave.reviewComment && (
                                            <div className="mt-1 text-[10px] text-gray-400 italic flex items-center">
                                                <MessageSquare className="w-3 h-3 mr-1" />"{leave.reviewComment}"
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 hidden sm:table-cell">
                                        <p className="text-sm text-gray-700 font-medium">{leave.leaveType}</p>
                                        <p className="text-[10px] text-gray-400">
                                            {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 text-sm font-bold text-emerald-600">{leave.days}d</td>
                                    <td className="px-5 py-4">
                                        {leave.status === 'Pending' ? (
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={() => handleReviewClick(leave._id, 'Approved')}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-100" title="Approve">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleReviewClick(leave._id, 'Rejected')}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-100" title="Reject">
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center"><StatusBadge status={leave.status} /></div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {allLeaves.filter(l => l.status === teamFilter).length === 0 && (
                                <tr><td colSpan="4" className="px-5 py-10 text-center text-gray-400 italic">No {teamFilter.toLowerCase()} team requests</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Section 1: My Own Leave History */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <SectionHeader icon={<UserCircle className="w-5 h-5" />} title="My Requests (Self Service)" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] sm:text-xs uppercase font-semibold text-gray-400">
                            <tr>
                                <th className="px-5 py-4">Type & Dates</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4 text-right">Days / Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {myLeaves.map(leave => (
                                <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-bold text-gray-800">{leave.leaveType}</p>
                                        <p className="text-[10px] text-gray-400">
                                            {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <StatusBadge status={leave.status} />
                                        {leave.reviewComment && (
                                            <p className="text-[10px] italic text-gray-400 mt-1">"{leave.reviewComment}"</p>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <p className="text-sm font-bold text-gray-400">{leave.days}d</p>
                                        {leave.status === 'Pending' && (
                                            <button onClick={() => handleCancel(leave._id)}
                                                className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center ml-auto mt-1">
                                                <X className="w-3 h-3 mr-1" />Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {myLeaves.length === 0 && (
                                <tr><td colSpan="3" className="px-5 py-10 text-center text-gray-400 italic">No personal leave records</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

/* ─────────────────────────────────────────────────────
   ADMIN PAGE
───────────────────────────────────────────────────── */
const AdminDashboard = ({ allLeaves, holidays, handleReviewClick }) => {
    const [sysStats, setSysStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [leavesFilter, setLeavesFilter] = useState('Pending');

    useEffect(() => {
        axios.get('/admin/stats').then(r => setSysStats(r.data)).catch(() => { });
        axios.get('/admin/users').then(r => setUsers(r.data)).catch(() => { });
    }, []);

    return (
        <div className="space-y-8">
            {/* ── Department-wise Key Leaves Summary Table ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-800">Department Overview</h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                                {sysStats?.departments?.length ?? 0} departments &nbsp;·&nbsp;
                                {sysStats?.users?.employees ?? 0} employees &nbsp;·&nbsp;
                                {sysStats?.users?.managers ?? 0} managers
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-[11px] font-bold">
                            <Users className="w-3 h-3" /> {sysStats?.users?.total ?? 0} Total People
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-100 rounded-full text-[11px] font-bold">
                            <ShieldCheck className="w-3 h-3" /> {sysStats?.users?.managers ?? 0} Managers
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[11px] font-bold">
                            <UserCircle className="w-3 h-3" /> {sysStats?.users?.employees ?? 0} Employees
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[600px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3 text-center">Total People</th>
                                <th className="px-6 py-3 text-center">Managers</th>
                                <th className="px-6 py-3 text-center">Employees</th>
                                <th className="px-6 py-3 text-center">On Leave</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sysStats?.departments?.map((dept, idx) => {
                                const COLORS = ['bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];
                                const dot = COLORS[idx % COLORS.length];

                                return (
                                    <tr key={dept.name} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">{dept.name}</p>
                                                    <p className="text-[10px] text-gray-400">{dept.total} member{dept.total !== 1 ? 's' : ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center"><span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">{dept.total}</span></td>
                                        <td className="px-6 py-4 text-center">{dept.managers > 0 ? <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-lg border border-sky-100">{dept.managers}</span> : <span className="text-gray-300">—</span>}</td>
                                        <td className="px-6 py-4 text-center">{dept.employees > 0 ? <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">{dept.employees}</span> : <span className="text-gray-300">—</span>}</td>
                                        <td className="px-6 py-4 text-center">{dept.onLeave > 0 ? <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-100">{dept.onLeave}</span> : <span className="text-gray-300">—</span>}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {sysStats?.departments?.length > 0 && (
                            <tfoot className="bg-gray-50 border-t-2 border-gray-200 text-xs font-bold text-gray-700">
                                <tr>
                                    <td className="px-6 py-3 text-gray-500 text-sm uppercase">Total</td>
                                    <td className="px-6 py-3 text-center">{sysStats.users.total}</td>
                                    <td className="px-6 py-3 text-center text-sky-700">{sysStats.users.managers}</td>
                                    <td className="px-6 py-3 text-center text-emerald-700">{sysStats.users.employees}</td>
                                    <td className="px-6 py-3 text-center text-rose-700">{sysStats.departments.reduce((sum, d) => sum + (d.onLeave || 0), 0)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                <div className="lg:col-span-2 flex flex-col">
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
                        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <SectionHeader icon={<Activity className="w-5 h-5" />} title="System Leave Requests" badge={`${allLeaves.filter(l => l.status === 'Pending').length} Pending`} />
                            <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                {['Pending', 'Approved', 'Rejected'].map(s => (
                                    <button key={s} onClick={() => setLeavesFilter(s)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${leavesFilter === s ? 'bg-white text-emerald-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>{s}</button>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-x-auto flex-grow">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[10px] sm:text-xs uppercase font-semibold text-gray-400">
                                    <tr>
                                        <th className="px-5 py-4">Employee</th>
                                        <th className="px-5 py-4 hidden sm:table-cell">Leave</th>
                                        <th className="px-5 py-4">Days</th>
                                        <th className="px-5 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {allLeaves.filter(l => l.status === leavesFilter).map(leave => (
                                        <tr key={leave._id} className="h    over:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-bold text-gray-800">{leave.user?.name}</p>
                                                <p className="text-[10px] text-gray-400">{leave.user?.role} · {leave.user?.department}</p>
                                                {leave.reviewComment && (
                                                    <p className="text-[10px] italic text-gray-400 mt-1 flex items-center">
                                                        <MessageSquare className="w-3 h-3 mr-1" />"{leave.reviewComment}"
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 hidden sm:table-cell">
                                                <p className="text-sm text-gray-700 font-medium">{leave.leaveType}</p>
                                                <p className="text-[10px] text-gray-400">{new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-bold text-emerald-600">{leave.days}d</td>
                                            <td className="px-5 py-4">
                                                {leave.status === 'Pending' ? (
                                                    <div className="flex justify-center space-x-2">
                                                        <button onClick={() => handleReviewClick(leave._id, 'Approved')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-100"><CheckCircle2 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleReviewClick(leave._id, 'Rejected')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-100"><XCircle className="w-4 h-4" /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center"><StatusBadge status={leave.status} /></div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {allLeaves.filter(l => l.status === leavesFilter).length === 0 && (
                                        <tr><td colSpan="4" className="px-5 py-10 text-center text-gray-400 italic">No {leavesFilter.toLowerCase()} requests</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <div className="flex flex-col">
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-gray-800 flex items-center"><Users className="w-4 h-4 mr-2 text-emerald-600" />Recent Users</h3>
                            <a href="/manage-users" className="text-[10px] font-bold text-emerald-600 flex items-center">View All <ChevronRight className="w-3 h-3" /></a>
                        </div>
                        <div className="space-y-3 flex-grow">
                            {users.slice(0, 6).map(u => (
                                <div key={u._id} className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">{u.name.charAt(0)}</div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                                        <p className="text-[10px] text-gray-400">{u.department}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${u.role === 'Admin' ? 'bg-purple-100 text-purple-600' : u.role === 'Manager' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>{u.role}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────
   Shared Holiday Panel
───────────────────────────────────────────────────── */
const HolidayPanel = ({ holidays, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
        <section className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-6 sm:p-8 max-w-md w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600"></div>
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-xl"><X className="w-5 h-5" /></button>
            <div className="flex items-center space-x-3 mb-6 mt-2">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><CalendarCheck className="w-6 h-6" /></div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Company Holidays</h3>
                    <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Yearly Calendar 2026</p>
                </div>
            </div>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                {holidays.map((h, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-all group border border-transparent hover:border-emerald-100">
                        <div className="bg-white p-2.5 rounded-xl shadow-sm text-center min-w-[50px] group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:scale-105">
                            <p className="text-sm font-black leading-none">{new Date(h.date).getDate()}</p>
                            <p className="text-[10px] uppercase font-bold opacity-60 tracking-wider font-bold tracking-wider opacity-60 uppercase tracking-wider">{new Date(h.date).toLocaleString('default', { month: 'short' })}</p>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-800 truncate group-hover:text-emerald-900 transition-colors uppercase tracking-tight">{h.name}</p>
                            <span className={`mt-1 inline-block text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase border ${h.type === 'PUBLIC' ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{h.type}</span>
                        </div>
                    </div>
                ))}
                {holidays.length === 0 && <div className="py-12 text-center text-gray-400">No upcoming holidays scheduled</div>}
            </div>
            <button onClick={onClose} className="mt-8 w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 uppercase tracking-wider text-sm">Close Calendar</button>
        </section>
    </div>
);

/* ─────────────────────────────────────────────────────
   ROOT DASHBOARD COMPONENT
───────────────────────────────────────────────────── */
const Dashboard = () => {
    const { user, checkUserLoggedIn } = useAuth();
    const [stats, setStats] = useState({ Pending: 0, Approved: 0, Rejected: 0, Total: 0, Remaining: 0, initialTotal: 0 });
    const [myLeaves, setMyLeaves] = useState([]);
    const [allLeaves, setAllLeaves] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [reviewModal, setReviewModal] = useState({ open: false, id: null, status: '', comment: '' });
    const [showHolidays, setShowHolidays] = useState(false);

    useEffect(() => {
        if (user) { fetchAll(); }
    }, [user]);

    const fetchAll = async () => {
        try {
            const [statsRes, myLeavesRes, holidaysRes] = await Promise.all([
                axios.get('/leaves/stats'),
                axios.get('/leaves/my-leaves'),
                axios.get('/holidays')
            ]);
            setStats(statsRes.data);
            setMyLeaves(myLeavesRes.data);
            const upcoming = holidaysRes.data.filter(h => new Date(h.date) >= new Date());
            setHolidays(upcoming);

            if (user?.role === 'Manager' || user?.role === 'Admin') {
                const allLeavesRes = await axios.get('/leaves');
                setAllLeaves(allLeavesRes.data);
            }
            checkUserLoggedIn();
        } catch (error) {
            toast.error('Failed to fetch dashboard data');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this leave request?')) return;
        try {
            await axios.patch(`/leaves/${id}/cancel`);
            toast.success('Leave cancelled');
            fetchAll();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to cancel');
        }
    };

    const handleReviewClick = (id, status) => setReviewModal({ open: true, id, status, comment: '' });

    const handleReviewSubmit = async () => {
        try {
            await axios.put(`/leaves/${reviewModal.id}`, { status: reviewModal.status, reviewComment: reviewModal.comment });
            toast.success(`Leave ${reviewModal.status}`);
            setReviewModal({ open: false, id: null, status: '', comment: '' });
            fetchAll();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to update');
        }
    };

    const roleLabel = { Employee: 'Employee Dashboard', Manager: 'Manager Dashboard', Admin: 'Admin Dashboard' };

    return (
        <DashboardLayout>
            <div className="p-4 sm:p-8">
                <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">{roleLabel[user?.role] || 'Dashboard'}</h1>
                        <p className="text-gray-500 mt-1">Welcome back, <span className="font-semibold">{user?.name}</span></p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <button onClick={() => setShowHolidays(true)}
                            title="View Company Holidays"
                            className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-100 transition-all text-emerald-600 group">
                            <CalendarCheck className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </header>

                {user?.role === 'Employee' && <EmployeeDashboard stats={stats} myLeaves={myLeaves} holidays={holidays} handleCancel={handleCancel} />}
                {user?.role === 'Manager' && <ManagerDashboard stats={stats} myLeaves={myLeaves} allLeaves={allLeaves} holidays={holidays} handleCancel={handleCancel} handleReviewClick={handleReviewClick} managerDept={user?.department} />}
                {user?.role === 'Admin' && <AdminDashboard allLeaves={allLeaves} holidays={holidays} handleReviewClick={handleReviewClick} />}
            </div>

            {reviewModal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-gray-100">
                        <button onClick={() => setReviewModal({ ...reviewModal, open: false })} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-xl"><X className="w-5 h-5" /></button>
                        <div className="flex items-center space-x-3 mb-6">
                            <div className={`p-4 rounded-2xl shadow-sm ${reviewModal.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}><MessageSquare className="w-6 h-6" /></div>
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight">{reviewModal.status} Leave</h3>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-5">{reviewModal.status === 'Rejected' ? 'Required: Provide reason' : 'Optional: Note to employee'}</p>
                        <textarea className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all min-h-[140px] text-sm font-medium" placeholder="Type your remarks here..." value={reviewModal.comment} onChange={(e) => setReviewModal({ ...reviewModal, comment: e.target.value })} />
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <button onClick={() => setReviewModal({ ...reviewModal, open: false })} className="py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm uppercase tracking-wider">Cancel</button>
                            <button onClick={handleReviewSubmit} className={`py-4 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 text-sm uppercase tracking-wider ${reviewModal.status === 'Approved' ? 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700' : 'bg-red-600 shadow-red-100 hover:bg-red-700'}`}>{reviewModal.status}</button>
                        </div>
                    </div>
                </div>
            )}

            {showHolidays && <HolidayPanel holidays={holidays} onClose={() => setShowHolidays(false)} />}
        </DashboardLayout>
    );
};

export default Dashboard;
