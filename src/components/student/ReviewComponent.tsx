import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { addReviewAction, getReviewByUserAndCourseAction } from "../../redux/actions/reviewActions";
import { RootState } from "../../redux/store";

interface IReview {
  _id?: string;
  userId: string | { _id: string; name: string; profile?: object };
  courseId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsResponse {
  reviews: IReview[];
  totalReviews: number;
}



interface RatingReviewProps {
  courseId: string;
  rating?: number;
  reviewCount?: number;
}

const RatingReview: React.FC<RatingReviewProps> = ({ courseId, rating = 0, reviewCount = 0 }) => {
  const maxStars = 5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.user.userData);
  const [userRating, setUserRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [userReview, setUserReview] = useState<IReview | null>(null);
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserReview = async () => {
      setFetchLoading(true);
      setFetchError(null);
      try {
        const result = await dispatch(getReviewByUserAndCourseAction(courseId)).unwrap() as ReviewsResponse;
        const currentUserId = userData?._id || "";
        const userReviewData = result.reviews.find((review) =>
          typeof review.userId === "object" && review.userId._id === currentUserId
        ) || null;
        setUserReview(userReviewData);
      } catch (err: any) {
        setFetchError(err.message || "Failed to fetch your review");
        setUserReview(null);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUserReview();
  }, [dispatch, courseId, userData]);

  const handleStarClick = (index: number) => {
    setUserRating(index + 1);
    setError(null);
  };

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
        comment: comment.trim() || undefined,
      };

      const newReview = await dispatch(addReviewAction(reviewData)).unwrap();
      setSuccess(true);
      setComment("");
      setUserRating(0);
      setUserReview(newReview);
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow-md">
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

      {fetchLoading ? (
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#49BBBD]"></div>
        </div>
      ) : fetchError ? (
        <p className="text-red-500 text-sm">{fetchError}</p>
      ) : userReview ? (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Review</h3>
          <div className="mt-2 flex items-center">
            {[...Array(maxStars)].map((_, index) => (
              <svg
                key={index}
                className={`w-5 h-5 ${index < userReview.rating ? "text-yellow-400" : "text-gray-300"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24 .588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          {userReview.comment && (
            <p className="mt-1 text-gray-600">{userReview.comment}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Posted on {new Date(userReview.createdAt).toLocaleDateString()}
          </p>
        </div>
      ) : (
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
                type="button"
                className="focus:outline-none"
                onClick={() => handleStarClick(index)}
                disabled={loading}
              >
                <svg
                  className={`w-5 h-5 ${index < userRating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
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
      )}
    </div>
  );
};

export default RatingReview;