import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryNotes: string;
  items: Array<{
    menuItem: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'cooking' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface MenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
}

const ChefDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
    
    // Setup Socket.IO
    const socketConnection = io('http://localhost:5000');
    setSocket(socketConnection);
    
    socketConnection.emit('join-chef');
    
    socketConnection.on('order-notification', (newOrder: Order) => {
      setOrders(prev => [newOrder, ...prev]);
      toast.success('New order received!');
    });
    
    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/orders/${orderId}/status`, { status });
      setOrders(prev => 
        prev.map(order => 
          order._id === orderId ? { ...order, status: status as any } : order
        )
      );
      
      if (socket) {
        socket.emit('order-status-update', { orderId, status });
      }
      
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const toggleItemAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      await axios.patch(`http://localhost:5000/api/menu/${itemId}/availability`, { isAvailable });
      setMenuItems(prev =>
        prev.map(item =>
          item._id === itemId ? { ...item, isAvailable } : item
        )
      );
      toast.success(`Item ${isAvailable ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update item availability');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cooking': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'cooking';
      case 'cooking': return 'ready';
      case 'ready': return 'delivered';
      default: return currentStatus;
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const cookingOrders = orders.filter(order => order.status === 'cooking');
  const readyOrders = orders.filter(order => order.status === 'ready');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Chef Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                activeTab === 'orders'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-blue-50'
              }`}
            >
              Orders Management
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                activeTab === 'menu'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-blue-50'
              }`}
            >
              Menu Availability
            </button>
          </div>
        </div>

        {activeTab === 'orders' ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Pending Orders */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-yellow-500 mr-2" />
                <h2 className="text-xl font-semibold">Pending Orders ({pendingOrders.length})</h2>
              </div>
              <div className="space-y-4">
                {pendingOrders.map(order => (
                  <div key={order._id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{order.customerName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{order.customerPhone}</p>
                    <div className="mb-3">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm">
                          {item.quantity}x {item.menuItem.name}
                        </p>
                      ))}
                    </div>
                    <p className="font-semibold text-orange-600">Total: ₹{order.totalAmount}</p>
                    <button
                      onClick={() => updateOrderStatus(order._id, getNextStatus(order.status))}
                      className="mt-2 w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition-colors"
                    >
                      Start Cooking
                    </button>
                  </div>
                ))}
                {pendingOrders.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No pending orders</p>
                )}
              </div>
            </div>

            {/* Cooking Orders */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold">Cooking ({cookingOrders.length})</h2>
              </div>
              <div className="space-y-4">
                {cookingOrders.map(order => (
                  <div key={order._id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{order.customerName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{order.customerPhone}</p>
                    <div className="mb-3">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm">
                          {item.quantity}x {item.menuItem.name}
                        </p>
                      ))}
                    </div>
                    <p className="font-semibold text-orange-600">Total: ₹{order.totalAmount}</p>
                    <button
                      onClick={() => updateOrderStatus(order._id, getNextStatus(order.status))}
                      className="mt-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Mark Ready
                    </button>
                  </div>
                ))}
                {cookingOrders.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No orders being cooked</p>
                )}
              </div>
            </div>

            {/* Ready Orders */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold">Ready for Pickup ({readyOrders.length})</h2>
              </div>
              <div className="space-y-4">
                {readyOrders.map(order => (
                  <div key={order._id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{order.customerName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{order.customerPhone}</p>
                    <p className="text-sm text-gray-600 mb-2">{order.customerAddress}</p>
                    {order.deliveryNotes && (
                      <p className="text-sm text-gray-500 mb-2">Notes: {order.deliveryNotes}</p>
                    )}
                    <div className="mb-3">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm">
                          {item.quantity}x {item.menuItem.name}
                        </p>
                      ))}
                    </div>
                    <p className="font-semibold text-orange-600">Total: ₹{order.totalAmount}</p>
                    <button
                      onClick={() => updateOrderStatus(order._id, 'delivered')}
                      className="mt-2 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                      Mark Delivered
                    </button>
                  </div>
                ))}
                {readyOrders.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No orders ready</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Menu Item Availability</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map(item => (
                <div key={item._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">₹{item.price}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        item.category === 'veg' ? 'bg-green-100 text-green-800' :
                        item.category === 'non-veg' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.category}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleItemAvailability(item._id, !item.isAvailable)}
                      className={`flex items-center ${
                        item.isAvailable ? 'text-green-500' : 'text-gray-400'
                      }`}
                    >
                      {item.isAvailable ? (
                        <ToggleRight className="h-8 w-8" />
                      ) : (
                        <ToggleLeft className="h-8 w-8" />
                      )}
                    </button>
                  </div>
                  <p className={`text-sm font-medium ${
                    item.isAvailable ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefDashboard;