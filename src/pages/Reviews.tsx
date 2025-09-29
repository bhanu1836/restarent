import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  menuItem?: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  isRestaurantReview: boolean;
  createdAt: string;
}

interface MenuItem {
  _id: string;
  name: string;
  category: string;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewType, setReviewType] = useState<'restaurant' | 'item'>('restaurant');
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [reviewForm, setReviewForm] = useState({
    customerName: '',
    customerEmail: '',
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
    fetchMenuItems();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const reviewData = {
        ...reviewForm,
        isRestaurantReview: reviewType === 'restaurant',
        ...(reviewType === 'item' && selectedMenuItem && { menuItem: selectedMenuItem })
      };
      
      await axios.post('http://localhost:5000/api/reviews', reviewData);
      toast.success('Review submitted successfully!');
      
      setShowReviewForm(false);
      setReviewForm({
        customerName: '',
        customerEmail: '',
        rating: 5,
        comment: ''
      });
      setSelectedMenuItem('');
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  const restaurantReviews = reviews.filter(review => review.isRestaurantReview);
  const itemReviews = reviews.filter(review => !review.isRestaurantReview);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Customer Reviews</h1>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-2xl font-bold text-gray-800">{averageRating.toFixed(1)}</span>
              <span className="text-gray-600">({reviews.length} reviews)</span>
            </div>
          </div>
        </div>

        {/* Add Review Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-colors shadow-lg"
          >
            Write a Review
          </button>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Write a Review</h2>
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review Type
                  </label>
                  <select
                    value={reviewType}
                    onChange={(e) => setReviewType(e.target.value as 'restaurant' | 'item')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="restaurant">Restaurant Review</option>
                    <option value="item">Menu Item Review</option>
                  </select>
                </div>

                {reviewType === 'item' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Menu Item
                    </label>
                    <select
                      value={selectedMenuItem}
                      onChange={(e) => setSelectedMenuItem(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select a menu item</option>
                      {menuItems.map(item => (
                        <option key={item._id} value={item._id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={reviewForm.customerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={reviewForm.customerEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {renderStars(reviewForm.rating, true, (rating) => 
                      setReviewForm(prev => ({ ...prev, rating }))
                    )}
                    <span className="text-gray-600">({reviewForm.rating}/5)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment
                  </label>
                  <textarea
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Share your experience..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 text-white py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reviews Display */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Restaurant Reviews */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <MessageCircle className="h-6 w-6 mr-2 text-orange-500" />
              Restaurant Reviews ({restaurantReviews.length})
            </h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {restaurantReviews.map(review => (
                <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="font-semibold text-gray-800">{review.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
              {restaurantReviews.length === 0 && (
                <p className="text-gray-500 text-center py-4">No restaurant reviews yet.</p>
              )}
            </div>
          </div>

          {/* Menu Item Reviews */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Star className="h-6 w-6 mr-2 text-orange-500" />
              Menu Item Reviews ({itemReviews.length})
            </h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {itemReviews.map(review => (
                <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-800">{review.customerName}</span>
                      </div>
                      {review.menuItem && (
                        <p className="text-sm text-orange-600 font-medium">{review.menuItem.name}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
              {itemReviews.length === 0 && (
                <p className="text-gray-500 text-center py-4">No menu item reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;