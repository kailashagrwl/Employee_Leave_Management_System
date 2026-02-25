import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import { toast } from 'react-hot-toast';
import {
    CalendarDays,
    Plus,
    Trash2,
    Calendar as CalendarIcon,
    Tag,
    Loader2,
    X
} from 'lucide-react';

const ManageHolidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        type: 'Public Holiday'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const { data } = await axios.get('/holidays');
            setHolidays(data);
        } catch (error) {
            toast.error('Failed to fetch holidays');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this holiday?')) return;
        try {
            await axios.delete(`/holidays/${id}`);
            toast.success('Holiday deleted');
            fetchHolidays();
        } catch (error) {
            toast.error('Failed to delete holiday');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.date) {
            return toast.error('Please fill in all required fields');
        }
        setSubmitting(true);
        try {
            await axios.post('/holidays', formData);
            toast.success('Holiday added successfully!');
            setShowModal(false);
            setFormData({ name: '', date: '', type: 'Public Holiday' });
            fetchHolidays();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to add holiday';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-4 sm:p-8">
                <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Manage Holidays</h1>
                        <p className="text-gray-500 mt-1 text-sm">Create and organize company/public holidays</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 text-sm"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Holiday
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-20">
                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                        </div>
                    ) : (
                        holidays.map((holiday) => (
                            <div key={holiday._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-emerald-200 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                        <CalendarDays className="w-6 h-6" />
                                    </div>
                                    <button
                                        onClick={() => handleDelete(holiday._id)}
                                        className="p-2 text-gray-300 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{holiday.name}</h3>
                                <p className="text-sm font-medium text-emerald-600 mb-4">
                                    {new Date(holiday.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <div className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-400">
                                    <Tag className="w-3 h-3 mr-1.5" />
                                    {holiday.type}
                                </div>
                            </div>
                        ))
                    )}
                    {!loading && holidays.length === 0 && (
                        <div className="col-span-full bg-white p-20 rounded-3xl border border-dashed border-gray-200 text-center">
                            <p className="text-gray-400 italic font-medium">No holidays found. Start by adding one!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Holiday Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                            <Plus className="w-6 h-6 mr-2 text-emerald-600" />
                            Add Holiday
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Holiday Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-4 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium"
                                        placeholder="e.g., New Year's Day"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full pl-4 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Type</label>
                                <select
                                    className="w-full pl-4 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium appearance-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Public Holiday">Public Holiday</option>
                                    <option value="Company Holiday">Company Holiday</option>
                                    <option value="Observance">Observance</option>
                                </select>
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center"
                                >
                                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Holiday'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ManageHolidays;
