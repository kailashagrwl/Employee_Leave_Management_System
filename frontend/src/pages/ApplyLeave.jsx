import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import { toast } from 'react-hot-toast';
import { Calendar, FileEdit, Send, Loader2 } from 'lucide-react';

const ApplyLeave = () => {
    const [formData, setFormData] = useState({
        leaveType: 'Sick Leave',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/leaves', formData);
            toast.success('Leave applied successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply leave');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <DashboardLayout>
            <div className="p-4 sm:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Apply for Leave</h1>
                    <p className="text-gray-500 mt-1">Submit your leave request for approval</p>
                </header>

                <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Leave Type</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <select
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                                >
                                    <option value="Sick Leave">Sick Leave</option>
                                    <option value="Casual Leave">Casual Leave</option>
                                    <option value="Annual Leave">Annual Leave</option>
                                    <option value="Maternity Leave">Maternity Leave</option>
                                    <option value="Paternity Leave">Paternity Leave</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    required
                                    onChange={handleChange}
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    required
                                    onChange={handleChange}
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason</label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 text-gray-400">
                                    <FileEdit className="h-5 w-5" />
                                </div>
                                <textarea
                                    name="reason"
                                    rows="4"
                                    required
                                    onChange={handleChange}
                                    placeholder="Explain the reason for your leave request..."
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                                ></textarea>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-4 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg shadow-emerald-100 transition-all duration-200 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-6 w-6" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" />
                                        Submit Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ApplyLeave;
