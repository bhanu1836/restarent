import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Phone, MapPin } from 'lucide-react';
import axios from 'axios';

interface SpecialItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
}

const Home: React.FC = () => {
  const [specialItems, setSpecialItems] = useState<SpecialItem[]>([]);
  const [recommendedItems, setRecommendedItems] = useState<SpecialItem[]>([]);

  useEffect(() => {
    fetchSpecialItems();
  }, []);

  const fetchSpecialItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/menu/specials');
      setSpecialItems(response.data.specialOfDay);
      setRecommendedItems(response.data.recommended);
    } catch (error) {
      console.error('Error fetching special items:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'veg': return 'border-green-500 bg-green-50';
      case 'non-veg': return 'border-red-500 bg-red-50';
      case 'kids': return 'border-orange-500 bg-orange-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Tasty Bites</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the finest dining with fresh ingredients, authentic flavors, and exceptional service.
          </p>
          <Link
            to="/menu"
            className="inline-block bg-white text-orange-500 px-8 py-3 rounded-full font-semibold text-lg hover:bg-orange-50 transition-colors shadow-lg"
          >
            View Menu
          </Link>
        </div>
      </section>

      {/* Special of the Day */}
      {specialItems.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Special of the Day
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {specialItems.map(item => (
                <div key={item._id} className={`border-2 rounded-lg p-6 ${getCategoryColor(item.category)} transform hover:scale-105 transition-transform shadow-lg`}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-orange-500">₹{item.price}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.category === 'veg' ? 'bg-green-100 text-green-800' :
                      item.category === 'non-veg' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {item.category.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended Items */}
      {recommendedItems.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Chef's Recommendations
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedItems.map(item => (
                <div key={item._id} className={`border-2 rounded-lg p-4 bg-white ${getCategoryColor(item.category)} transform hover:scale-105 transition-transform shadow-md`}>
                  <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-orange-500">₹{item.price}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">Recommended</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable delivery service to your doorstep</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Food</h3>
              <p className="text-gray-600">Fresh ingredients and authentic recipes for the best taste</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support for any queries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">Visit Us</h2>
          <div className="flex justify-center items-center space-x-8">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>123 Food Street, Tasty City, TC 12345</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>+1 234 567 8900</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;