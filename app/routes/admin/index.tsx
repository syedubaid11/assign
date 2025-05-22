import { useEffect, useState } from "react"
import { useNavigate } from "@remix-run/react";
import axios from 'axios';

const directus_url = 'http://128.140.75.83:2221';

interface Feedback {
  id: number;
  title: string;
  description: string;
  category: string;
  status?: string;
}

export default function Admin() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newFeedback, setNewFeedback] = useState({
        title: '',
        description: '',
        category: ''
    });

    useEffect(() => {
        const adminSession = localStorage.getItem('admin_token');
        const accessToken = localStorage.getItem('directus_token');

        if (adminSession && accessToken) {
            setIsAuthenticated(true);
            setToken(accessToken);
        } else {
            navigate('/adminlogin');
        }
        setLoading(false);
    }, [navigate]);


    useEffect(() => {
        if (token && isAuthenticated) {
            fetchFeedbacks();
        }
    }, [token, isAuthenticated]);

    const fetchFeedbacks = async () => {
        try {
            const res = await axios.get(`${directus_url}/items/feedbacks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFeedback(res.data.data || []);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('directus_token');
                navigate('/adminlogin');
            }
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await axios.patch(`${directus_url}/items/feedbacks/${id}`, 
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            await fetchFeedbacks();
            alert('Status Updated successfully');
        } catch (error) {
            console.error("Error updating status:", error);
            setError(error instanceof Error ? error.message : 'Failed to update status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) {
            return;
        }

        try {
            await axios.delete(`${directus_url}/items/feedbacks/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFeedback(feedback.filter(item => item.id !== id));
            alert('Feedback deleted successfully');
        } catch (error) {
            console.error('Error deleting feedback:', error);
            alert('Failed to delete feedback');
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newFeedback.title || !newFeedback.description || !newFeedback.category) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const res = await axios.post(`${directus_url}/items/feedbacks`, newFeedback, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            setFeedback([...feedback, res.data.data]);
            
            setNewFeedback({ title: '', description: '', category: '' });
            setShowAddForm(false);
            alert('Feedback added successfully');
        } catch (error) {
            console.error('Error adding feedback:', error);
            alert('Failed to add feedback');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('directus_token');
        navigate('/adminlogin');
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null; 
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <div className="space-x-2">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        {showAddForm ? 'Cancel' : 'Add Feedback'}
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="border border-red-500 text-red-500 hover:bg-red-50 px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* feedback form*/}
            {showAddForm && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold mb-4">Add New Feedback</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                                type="text"
                                value={newFeedback.title}
                                onChange={(e) => setNewFeedback({...newFeedback, title: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={newFeedback.description}
                                onChange={(e) => setNewFeedback({...newFeedback, description: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                value={newFeedback.category}
                                onChange={(e) => setNewFeedback({...newFeedback, category: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select a category</option>
                                <option value="bug">Bug Report</option>
                                <option value="feature">Feature Request</option>
                                <option value="improvement">Improvement</option>
                                <option value="general">General</option>
                            </select>
                        </div>
                        <div className="flex space-x-2">
                            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                                Add Feedback
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setShowAddForm(false)}
                                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* feedback lists */}
            <div>
                <h2 className="text-xl font-bold mb-4">All Feedbacks ({feedback.length})</h2>
                {feedback.length > 0 ? (
                    <div className="space-y-4">
                        {feedback.map((item) => (
                            <div key={item.id} className="border p-4 rounded-lg shadow bg-white">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-black">{item.title}</h3>
                                    <div className="flex space-x-2">
                                        <select
                                            value={item.status || 'pending'}
                                            onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <p className="text-black mb-2">{item.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                        {item.category}
                                    </span>
                                    <span className="text-xs text-gray-500">ID: {item.id}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No feedbacks yet.</p>
                        <button 
                            onClick={() => setShowAddForm(true)}
                            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Add First Feedback
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}