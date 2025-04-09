// RatingReview.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store"; // Adjust path to your store
import { addReviewAction } from "../../redux/actions/reviewActions"; // Adjust path


interface RatingReviewProps {
  courseId: string; // Added courseId prop to know which course is being reviewed
  rating?: number; // Average rating (display only)
  reviewCount?: number; // Total reviews (display only)
}

const RatingReview: React.FC<RatingReviewProps> = ({ courseId, rating = 0, reviewCount = 0 }) => {
  const maxStars = 5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const dispatch = useDispatch<AppDispatch>();
  const [userRating, setUserRating] = useState<number>(0); // User's selected rating
  const [comment, setComment] = useState<string>(""); // User's review comment
  const [loading, setLoading] = useState<boolean>(false); // Local loading state
  const [error, setError] = useState<string | null>(null); // Local error state
  const [success, setSuccess] = useState<boolean>(false); // Success feedback

  // Handle star click to set user rating
  const handleStarClick = (index: number) => {
    setUserRating(index + 1); // Rating is 1-based (1 to 5)
    setError(null); // Clear error on interaction
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userRating) {
      setError("Please provide a rating.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const reviewData = {
        courseId,
        rating: userRating,
        comment: comment.trim() || undefined, // Send undefined if comment is empty
      };

      // Dispatch the action and unwrap the result; no need to store it
      await dispatch(addReviewAction(reviewData)).unwrap();
      setSuccess(true);
      setComment(""); // Clear comment field
      setUserRating(0); // Reset rating
    } catch (err) {
      // Type the error as an object with a message property
      const error = err as { message?: string };
      setError(error.message || "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2 p-4 bg-white rounded-lg shadow-md">
      {/* Rating Display */}
      <div className="flex items-center space-x-2">
        <div className="flex">
          {[...Array(maxStars)].map((_, index) => (
            <svg
              key={index}
              className={`w-5 h-5 ${
                index < fullStars
                  ? "text-yellow-400"
                  : index === fullStars && hasHalfStar
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24 .588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-gray-700 font-semibold">{rating.toFixed(1)}</span>
        <span className="text-gray-500 text-sm">({reviewCount} reviews)</span>
      </div>

      {/* Review Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <textarea
          className="w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#49BBBD] text-gray-700"
          rows={3}
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={loading}
        />
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Rate:</span>
          {[...Array(maxStars)].map((_, index) => (
            <button
              key={index}
              type="button" // Prevent form submission on star click
              className="focus:outline-none"
              onClick={() => handleStarClick(index)}
              disabled={loading}
            >
              <svg
                className={`w-5 h-5 ${
                  index < userRating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24 .588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="self-end bg-[#49BBBD] text-white px-4 py-2 rounded-md hover:bg-[#3a9fa1] transition-colors disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && (
          <p className="text-green-500 text-sm">Review submitted successfully!</p>
        )}
      </form>
    </div>
  );
};

export default RatingReview;