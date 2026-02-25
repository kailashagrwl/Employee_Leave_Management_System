import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    UserPlus, Mail, Lock, User, Briefcase, Loader2,
    Shield, ShieldCheck, ShieldAlert
} from 'lucide-react';

const ROLES = [
    {
        value: 'Employee',
        label: 'Employee',
        desc: 'Apply & track personal leaves',
        icon: Shield,
        color: 'emerald'
    },
    {
        value: 'Manager',
        label: 'Manager',
        desc: 'Manage team leave requests',
        icon: ShieldCheck,
        color: 'blue'
    },
    {
        value: 'Admin',
        label: 'Admin',
        desc: 'Full system administration',
        icon: ShieldAlert,
        color: 'purple'
    }
];

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: '',
        role: 'Employee'
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(formData);
            toast.success('Registration successful!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-emerald-50 px-4 py-10">
            <div className="max-w-md w-full space-y-8 bg-white p-7 sm:p-10 rounded-3xl shadow-2xl animate-fade-in border border-gray-100">

                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-5">
                        <div className="p-4 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-100">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        Join LeaveFlow — select your role to get started
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>

                    {/* Role Selection Cards */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                            Select Role
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {ROLES.map(({ value, label, desc, icon: Icon, color }) => {
                                const isSelected = formData.role === value;
                                const colorMap = {
                                    emerald: {
                                        border: isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 bg-gray-50',
                                        icon: isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-gray-400',
                                        label: isSelected ? 'text-emerald-700 font-bold' : 'text-gray-600 font-medium',
                                        dot: 'bg-emerald-500'
                                    },
                                    blue: {
                                        border: isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 bg-gray-50',
                                        icon: isSelected ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400',
                                        label: isSelected ? 'text-blue-700 font-bold' : 'text-gray-600 font-medium',
                                        dot: 'bg-blue-500'
                                    },
                                    purple: {
                                        border: isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300 bg-gray-50',
                                        icon: isSelected ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-400',
                                        label: isSelected ? 'text-purple-700 font-bold' : 'text-gray-600 font-medium',
                                        dot: 'bg-purple-500'
                                    }
                                };
                                const c = colorMap[color];
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: value })}
                                        className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer ${c.border}`}
                                    >
                                        {isSelected && (
                                            <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${c.dot}`} />
                                        )}
                                        <div className={`p-2 rounded-xl mb-2 transition-colors ${c.icon}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-xs transition-colors ${c.label}`}>{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {/* Role description */}
                        <p className="mt-2 text-center text-[11px] text-gray-400 italic">
                            {ROLES.find(r => r.value === formData.role)?.desc}
                        </p>
                    </div>

                    {/* Name */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                            <User className="h-5 w-5" />
                        </div>
                        <input
                            name="name"
                            type="text"
                            required
                            className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Email */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                            <Mail className="h-5 w-5" />
                        </div>
                        <input
                            name="email"
                            type="email"
                            required
                            className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                            <Lock className="h-5 w-5" />
                        </div>
                        <input
                            name="password"
                            type="password"
                            required
                            className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                            placeholder="Password (min 6 chars)"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Department */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <input
                            name="department"
                            type="text"
                            required
                            className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                            placeholder="Department (e.g. Engineering, HR)"
                            value={formData.department}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-4 px-4 text-base font-bold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all duration-200 disabled:opacity-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Create Account →'}
                        </button>
                    </div>
                </form>

                <div className="text-center pt-2">
                    <p className="text-sm text-gray-500 font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
