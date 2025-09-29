import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  ingredients?: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/menu');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!item.isAvailable) {
      toast.error('This item is currently unavailable');
      return;
    }
    
    addToCart({
      id: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category
    });
    
    toast.success(`${item.name} added to cart!`);
  };

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const categories = [
    { id: 'all', name: 'All Items', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: '🍽️' },
    { id: 'veg', name: 'Vegetarian', color: 'bg-gradient-to-r from-green-400 to-green-600', icon: '🥬' },
    { id: 'non-veg', name: 'Non-Vegetarian', color: 'bg-gradient-to-r from-red-400 to-red-600', icon: '🍖' },
    { id: 'kids', name: 'Kids Special', color: 'bg-gradient-to-r from-orange-400 to-yellow-500', icon: '🧒' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Our Menu</h1>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold text-white transition-all transform hover:scale-105 shadow-lg ${
                activeCategory === category.id 
                  ? category.color + ' ring-4 ring-white ring-opacity-50' 
                  : category.color + ' opacity-70 hover:opacity-100'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <div 
              key={item._id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ${
                !item.isAvailable ? 'opacity-60' : ''
              }`}
            >
              {/* Item Image */}
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">
                    {item.category === 'veg' ? '🥗' : 
                     item.category === 'non-veg' ? '🍖' : '🍕'}
                  </span>
                )}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Out of Stock</span>
                  </div>
                )}
                <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold text-white ${
                  item.category === 'veg' ? 'bg-green-500' :
                  item.category === 'non-veg' ? 'bg-red-500' :
                  'bg-orange-500'
                }`}>
                  {item.category === 'non-veg' ? 'Non-Veg' : 
                   item.category === 'veg' ? 'Veg' : 'Kids'}
                </div>
              </div>

              {/* Item Details */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">{item.name}</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.description}</p>
                
                {/* Ingredients */}
                {item.ingredients && item.ingredients.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Ingredients:</h4>
                    <p className="text-xs text-gray-500">{item.ingredients.join(', ')}</p>
                  </div>
                )}

                {/* Nutrition Info */}
                {item.nutritionInfo && (
                  <div className="mb-4 bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Nutrition (per serving):</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span>Calories: {item.nutritionInfo.calories}</span>
                      <span>Protein: {item.nutritionInfo.protein}g</span>
                      <span>Carbs: {item.nutritionInfo.carbs}g</span>
                      <span>Fat: {item.nutritionInfo.fat}g</span>
                    </div>
                  </div>
                )}

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-500">₹{item.price}</span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.isAvailable}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-colors ${
                      item.isAvailable
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;