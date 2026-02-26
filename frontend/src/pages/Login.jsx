import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(localStorage.getItem('rememberedEmail') ? true : false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            toast.success('Logged in successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[100dvh] w-screen flex items-center justify-center bg-[#f0f2f5] p-4 sm:p-6 lg:p-8 overflow-hidden font-['Outfit',sans-serif]">
            {/* Main Centered Box Container */}
            <div className="w-full max-w-6xl h-full lg:h-[min(700px,85vh)] flex flex-col lg:flex-row bg-white rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15),0_30px_60px_-30px_rgba(0,0,0,0.2)]">

                {/* Left Side: Editorial Hero */}
                <div className="hidden lg:flex lg:w-[45%] h-full bg-[#020a08] relative overflow-hidden px-16 py-16 flex-col justify-between">
                    {/* Glowing Core Background */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,#064e3b_0%,transparent_70%)] opacity-30" />
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-16">
                            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                <div className="w-3.5 h-3.5 bg-white rounded-sm rotate-45" />
                            </div>
                            <span className="text-lg font-bold text-white tracking-widest uppercase italic">Leave<span className="text-emerald-500">Flow</span></span>
                        </div>

                        <div className="max-w-md">
                            <h1 className="text-4xl font-bold text-white leading-[1.1] tracking-tighter mb-6">
                                Managing <span className="text-emerald-500">Leaves</span> <br /> Simplified for you.
                            </h1>
                            <p className="text-base text-gray-500 leading-relaxed font-medium mb-10">
                                Take control of your team's time and expenses with our all-in-one management portal.
                            </p>

                            <div className="space-y-4">
                                {['One-Click Requests', 'Track Claims Instantly', 'Department Oversight'].map((text, i) => (
                                    <div key={i} className="flex items-center space-x-3 group cursor-default">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform duration-300" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Footer section removed */}
                </div>

                {/* Right Side: High-Precision Form */}
                <div className="w-full lg:w-[55%] h-full bg-white flex items-center justify-center p-8 sm:p-12 lg:p-16 relative overflow-y-auto lg:overflow-hidden">
                    <div className="w-full max-w-sm">
                        <div className="mb-10">
                            <div className="lg:hidden flex items-center space-x-3 mb-6">
                                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                                    <div className="w-3.5 h-3.5 bg-white rounded-sm rotate-45" />
                                </div>
                                <span className="text-lg font-black text-gray-900 tracking-tighter uppercase italic">LeaveFlow</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Login.</h2>
                            <p className="text-gray-400 text-sm font-medium">Enter your work credentials to access the portal.</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-300  text-gray-800 placeholder:text-gray-300 text-sm outline-none"
                                            placeholder="email@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-300 font-bold text-gray-800 placeholder:text-gray-300 text-sm outline-none"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <label className="flex items-center space-x-2.5 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-50 border-gray-200 group-hover:border-emerald-500'}`}>
                                            {rememberMe && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                                        </div>
                                    </div>
                                    <span className={`text-[11px] font-bold transition-colors ${rememberMe ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>Stay logged in</span>
                                </label>

                                <button
                                    type="button"
                                    onClick={() => toast.info('Contact system administrator')}
                                    className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700"
                                >
                                    Help?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gray-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center uppercase tracking-[0.3em] shadow-lg hover:shadow-emerald-200"
                            >
                                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Log In'}
                            </button>
                        </form>

                        <div className="mt-8 text-center border-t border-gray-50 pt-6">
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                                New to LeaveFlow? {' '}
                                <Link
                                    to="/register"
                                    className="text-emerald-600 hover:text-emerald-700 font-black ml-1"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
