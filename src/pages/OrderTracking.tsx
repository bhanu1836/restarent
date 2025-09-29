import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, CheckCircle, Truck, MapPin, Phone } from 'lucide-react';
import axios from 'axios';
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

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      
      // Setup Socket.IO for real-time updates
      const socketConnection = io('http://localhost:5000');
      setSocket(socketConnection);
      
      socketConnection.on('order-status-changed', (data) => {
        if (data.orderId === orderId) {
          setOrder(prev => prev ? { ...prev, status: data.status } : null);
        }
      });
      
      return () => {
        socketConnection.disconnect();
      };
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'cooking': return 1;
      case 'ready': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock, color: 'text-yellow-500' },
    { key: 'cooking', label: 'Cooking', icon: Clock, color: 'text-blue-500' },
    { key: 'ready', label: 'Ready for Pickup', icon: CheckCircle, color: 'text-green-500' },
    { key: 'delivered', label: 'Delivered', icon: Truck, color: 'text-purple-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Order not found</h2>
          <p className="text-gray-500">Please check your order ID and try again.</p>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Order Tracking</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Order #{order._id.slice(-6)}</h2>
              <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-500">₹{order.totalAmount}</p>
              <p className="text-gray-600">{order.items.length} items</p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {statusSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index <= currentStep;
                const isActive = index === currentStep;
                
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive 
                        ? step.color + ' bg-gray-100' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      <StepIcon className="h-6 w-6" />
                    </div>
                    <p className={`text-sm font-medium text-center ${
                      isCompleted ? 'text-green-600' : isActive ? step.color : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                    {index < statusSteps.length - 1 && (
                      <div className={`h-1 w-full mt-4 ${
                        index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Contact Information
              </h3>
              <p className="text-gray-600">{order.customerName}</p>
              <p className="text-gray-600">{order.customerPhone}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Delivery Address
              </h3>
              <p className="text-gray-600">{order.customerAddress}</p>
              {order.deliveryNotes && (
                <p className="text-gray-500 text-sm mt-1">Notes: {order.deliveryNotes}</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                  <div>
                    <p className="font-medium">{item.menuItem.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-orange-500">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'cooking' ? 'bg-blue-100 text-blue-800' :
            order.status === 'ready' ? 'bg-green-100 text-green-800' :
            order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status === 'pending' && 'Your order has been received and is being prepared'}
            {order.status === 'cooking' && 'Your order is being cooked with love'}
            {order.status === 'ready' && 'Your order is ready for pickup/delivery'}
            {order.status === 'delivered' && 'Your order has been delivered. Enjoy your meal!'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;