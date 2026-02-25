import { Link } from 'react-router-dom';
import { ShieldX, Home } from 'lucide-react';

const Unauthorized = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center space-y-8 glass p-12 rounded-2xl shadow-xl border border-white animate-fade-in">
                <div className="flex justify-center">
                    <div className="p-4 bg-red-100 rounded-2xl">
                        <ShieldX className="w-16 h-16 text-red-600" />
                    </div>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Access Denied</h1>
                <p className="text-gray-500 text-lg">
                    You don't have permission to access this page. Please contact your administrator if you think this is a mistake.
                </p>
                <div>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all duration-200"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
