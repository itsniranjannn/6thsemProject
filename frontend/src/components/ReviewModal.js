import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';

const ReviewModal = ({ product, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmitReview = async () => {
    if (!rating) {
      alert('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      alert('Please write a review comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          product_id: product.id,
          rating,
          comment: comment.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        onReviewSubmitted();
        onClose();
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (forInput = false) => {
    return [1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => forInput && setRating(star)}
        onMouseEnter={() => forInput && setHoverRating(star)}
        onMouseLeave={() => forInput && setHoverRating(0)}
        className={`text-3xl ${
          star <= (hoverRating || rating)
            ? 'text-yellow-400 transform scale-110'
            : 'text-gray-300'
        } transition-all duration-200`}
      >
        ★
      </button>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
          <div className="flex items-center gap-4">
            <div className="flex">
              {renderStars(true)}
            </div>
            <span className="text-sm text-gray-600">
              {rating ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitReview}
            disabled={submitting || !rating || !comment.trim()}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;