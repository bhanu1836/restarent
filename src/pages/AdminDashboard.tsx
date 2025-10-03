import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { DollarSign, ShoppingBag, TrendingUp, Users, Plus, CreditCard as Edit, Trash2, Star, ToggleLeft, ToggleRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  popularItems: Array<{
    _id: string;
    count: number;
    item: Array<{ name: string; category: string }>;
  }>;
  dailySales: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  isSpecialOfDay: boolean;
  isRecommended: boolean;
}

interface Chef {
  _id: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'menu' | 'chefs'>('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showChefForm, setShowChefForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'veg',
    isSpecialOfDay: false,
    isRecommended: false
  });

  const [chefForm, setChefForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'chef' as 'chef' | 'admin'
  });

  useEffect(() => {
    fetchAnalytics();
    fetchMenuItems();
    fetchChefs();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/menu');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchChefs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/chefs');
      setChefs(response.data);
    } catch (error) {
      console.error('Error fetching chefs:', error);
    }
  };

  const handleMenuFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await axios.put(`http://localhost:5000/api/menu/${editingItem._id}`, menuForm);
        toast.success('Menu item updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/menu', menuForm);
        toast.success('Menu item added successfully!');
      }
      
      setShowMenuForm(false);
      setEditingItem(null);
      setMenuForm({
        name: '',
        description: '',
        price: 0,
        category: 'veg',
        isSpecialOfDay: false,
        isRecommended: false
      });
      fetchMenuItems();
    } catch (error) {
      toast.error('Failed to save menu item');
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      isSpecialOfDay: item.isSpecialOfDay,
      isRecommended: item.isRecommended
    });
    setShowMenuForm(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:5000/api/menu/${itemId}`);
        toast.success('Menu item deleted successfully!');
        fetchMenuItems();
      } catch (error) {
        toast.error('Failed to delete menu item');
      }
    }
  };

  const toggleChefStatus = async (chefId: string, isActive: boolean) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/chefs/${chefId}/status`, { isActive });
      setChefs(prev =>
        prev.map(chef =>
          chef._id === chefId ? { ...chef, isActive } : chef
        )
      );
      toast.success(`Chef ${isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      toast.error('Failed to update chef status');
    }
  };

  const handleChefFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/api/auth/register', chefForm);
      toast.success('Staff member created successfully!');
      setShowChefForm(false);
      setChefForm({
        username: '',
        email: '',
        password: '',
        role: 'chef'
      });
      fetchChefs();
    } catch (error) {
      toast.error('Failed to create staff member');
    }
  };

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
          <div className="flex space-x-4">
            {['analytics', 'menu', 'chefs'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-full font-semibold transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-purple-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Orders</p>
                    <p className="text-3xl font-bold">{analytics.totalOrders}</p>
                  </div>
                  <ShoppingBag className="h-12 w-12 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Total Revenue</p>
                    <p className="text-3xl font-bold">₹{analytics.totalRevenue}</p>
                  </div>
                  <DollarSign className="h-12 w-12 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Avg Order Value</p>
                    <p className="text-3xl font-bold">
                      ₹{analytics.totalOrders > 0 ? Math.round(analytics.totalRevenue / analytics.totalOrders) : 0}
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-purple-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Active Chefs</p>
                    <p className="text-3xl font-bold">{chefs.filter(chef => chef.isActive).length}</p>
                  </div>
                  <Users className="h-12 w-12 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Daily Sales Chart */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Daily Sales (Last 30 Days)</h3>
                <div className="h-[300px]">
                  <Line
                    data={{
                      labels: analytics.dailySales.map(item => item._id),
                      datasets: [
                        {
                          label: 'Revenue',
                          data: analytics.dailySales.map(item => item.revenue),
                          borderColor: 'rgb(136, 132, 216)',
                          backgroundColor: 'rgba(136, 132, 216, 0.5)',
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Popular Items Chart */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Popular Items</h3>
                <div className="h-[300px]">
                  <Bar
                    data={{
                      labels: analytics.popularItems.map(item => item.item[0]?.name || 'Unknown'),
                      datasets: [
                        {
                          label: 'Orders',
                          data: analytics.popularItems.map(item => item.count),
                          backgroundColor: 'rgba(136, 132, 216, 0.8)',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Menu Management</h2>
              <button
                onClick={() => setShowMenuForm(true)}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map(item => (
                <div key={item._id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                      <p className="text-xl font-bold text-purple-600 mt-2">₹{item.price}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.category === 'veg' ? 'bg-green-100 text-green-800' :
                      item.category === 'non-veg' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {item.category}
                    </span>
                    {item.isSpecialOfDay && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        Special
                      </span>
                    )}
                    {item.isRecommended && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        Recommended
                      </span>
                    )}
                  </div>
                  
                  <div className={`text-sm font-medium ${
                    item.isAvailable ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </div>
                </div>
              ))}
            </div>

            {/* Menu Form Modal */}
            {showMenuForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                  </h2>
                  
                  <form onSubmit={handleMenuFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={menuForm.name}
                        onChange={(e) => setMenuForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={menuForm.description}
                        onChange={(e) => setMenuForm(prev => ({ ...prev, description: e.target.value }))}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        value={menuForm.price}
                        onChange={(e) => setMenuForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={menuForm.category}
                        onChange={(e) => setMenuForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="veg">Vegetarian</option>
                        <option value="non-veg">Non-Vegetarian</option>
                        <option value="kids">Kids</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={menuForm.isSpecialOfDay}
                          onChange={(e) => setMenuForm(prev => ({ ...prev, isSpecialOfDay: e.target.checked }))}
                          className="mr-2"
                        />
                        Special of the Day
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={menuForm.isRecommended}
                          onChange={(e) => setMenuForm(prev => ({ ...prev, isRecommended: e.target.checked }))}
                          className="mr-2"
                        />
                        Recommended
                      </label>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 bg-purple-500 text-white py-2 rounded-md font-semibold hover:bg-purple-600 transition-colors"
                      >
                        {editingItem ? 'Update' : 'Add'} Item
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenuForm(false);
                          setEditingItem(null);
                          setMenuForm({
                            name: '',
                            description: '',
                            price: 0,
                            category: 'veg',
                            isSpecialOfDay: false,
                            isRecommended: false
                          });
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md font-semibold hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chefs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Chef Management</h2>
              <button
                onClick={() => setShowChefForm(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Staff</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chef
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {chefs.map(chef => (
                      <tr key={chef._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-purple-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{chef.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {chef.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(chef.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            chef.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {chef.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => toggleChefStatus(chef._id, !chef.isActive)}
                            className={`flex items-center ${
                              chef.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {chef.isActive ? (
                              <>
                                <ToggleLeft className="h-5 w-5 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleRight className="h-5 w-5 mr-1" />
                                Activate
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {showChefForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Staff Member</h2>

                  <form onSubmit={handleChefFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={chefForm.username}
                        onChange={(e) => setChefForm(prev => ({ ...prev, username: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={chefForm.email}
                        onChange={(e) => setChefForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={chefForm.password}
                        onChange={(e) => setChefForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={chefForm.role}
                        onChange={(e) => setChefForm(prev => ({ ...prev, role: e.target.value as 'chef' | 'admin' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="chef">Chef</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 bg-orange-500 text-white py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors"
                      >
                        Create Staff
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowChefForm(false);
                          setChefForm({
                            username: '',
                            email: '',
                            password: '',
                            role: 'chef'
                          });
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md font-semibold hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;