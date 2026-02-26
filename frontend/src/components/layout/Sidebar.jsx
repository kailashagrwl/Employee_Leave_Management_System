import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    FileText,
    Users,
    LogOut,
    Calendar,
    UserCircle,
    X,
    CalendarDays,
    Receipt
} from 'lucide-react';

const Sidebar = ({ closeSidebar }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        {
            title: 'Dashboard',
            path: '/dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            roles: ['Employee', 'Manager', 'Admin']
        },
        {
            title: 'Apply Leave',
            path: '/apply-leave',
            icon: <Calendar className="w-5 h-5" />,
            roles: ['Employee', 'Manager', 'Admin']
        },
        {
            title: 'Manage Users',
            path: '/manage-users',
            icon: <Users className="w-5 h-5" />,
            roles: ['Admin']
        },
        {
            title: 'Manage Holidays',
            path: '/manage-holidays',
            icon: <CalendarDays className="w-5 h-5" />,
            roles: ['Admin']
        },
        {
            title: 'Reimbursements',
            path: '/reimbursements',
            icon: <Receipt className="w-5 h-5" />,
            roles: ['Employee', 'Manager', 'Admin']
        }
    ];

    return (
        <div className="sidebar w-full h-full min-h-screen bg-white flex flex-col">
            {/* Branding - Fixed at Top */}
            <div className="p-6 flex-shrink-0 flex items-center space-x-3 border-b border-transparent">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <FileText className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-bold text-gray-800 tracking-tight">LeaveFlow</span>
                <button className="lg:hidden ml-auto p-2 text-gray-400 hover:text-gray-600" onClick={closeSidebar}>
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Navigation links - Expanding naturally with page */}
            <div className="flex-1 px-4 py-4 space-y-1">
                <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Main Menu</p>
                {menuItems
                    .filter(item => item.roles.includes(user?.role))
                    .map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-emerald-50 text-emerald-600 font-bold shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-emerald-600'
                                }`
                            }
                        >
                            {item.icon}
                            <span className="text-sm">{item.title}</span>
                        </NavLink>
                    ))}
            </div>

            {/* User Profile Area - Fixed at Bottom */}
            <div className="flex-shrink-0 border-t border-gray-100 p-4 bg-gray-50/30">
                <div className="flex items-center space-x-3 px-3 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm transition-transform active:scale-[0.98]">
                    <div className="bg-emerald-100 p-2.5 rounded-xl shrink-0">
                        <UserCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-black text-gray-800 truncate leading-tight">{user?.name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 w-full px-4 py-3.5 mt-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-black text-xs uppercase tracking-widest group"
                >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
