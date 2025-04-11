import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Star, User } from "lucide-react";
import { AppDispatch } from "../../redux/store";
import { getReviewsByCourseAction } from "../../redux/actions/reviewActions";

// Define interfaces
interface Review {
  _id: string;
  userId: { name: string };
  courseId: string;
  rating: number;
  comment: string;
  timeAgo?: string;
  hasMore?: boolean;
}

interface ReviewsData {
  reviews: Review[];
  totalReviews: number;
  averageRating?: number;
}

interface IResponse {
  success?: boolean;
  message?: string;
  data?: ReviewsData;
}

interface PlainResponse {
  reviews: Review[];
  totalReviews: number;
  averageRating?: number;
}

interface ReviewsSectionProps {
  courseId: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ courseId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(4.6);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchReviews = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        if (!courseId || !/^[0-9a-fA-F]{24}$/.test(courseId)) {
          throw new Error("Invalid courseId format");
        }
        
        const result: IResponse | PlainResponse = await dispatch(
          getReviewsByCourseAction({ courseId, skip: 0, limit: 10 })
        ).unwrap();
        
        if ('success' in result && result.success === true && result.data) {
          setReviews(result.data.reviews || []);
          setTotalReviews(result.data.totalReviews || 0);
          setAverageRating(result.data.averageRating || 4.6);
        } else if ('reviews' in result && Array.isArray(result.reviews)) {
          setReviews(result.reviews || []);
          setTotalReviews(result.totalReviews || 0);
          setAverageRating(result.averageRating || 4.6);
        } else {
          setError("Failed to fetch reviews");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch reviews";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [dispatch, courseId]);

  const toggleShowMore = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < rating ? "fill-yellow-400" : "stroke-yellow-400 fill-none"}`} 
          />
        ))}
      </div>
    );
  };

  if (loading) return <div className="text-center py-6">Loading reviews...</div>;
  if (error) return <div className="text-center py-6 text-red-500">{error}</div>;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{totalReviews.toLocaleString()} Reviews</h2>
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xl font-bold">{averageRating.toFixed(1)}</span>
          {renderStars(averageRating)}
          <span className="text-gray-500">course rating</span>
        </div>
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {reviews.map((review: Review) => (
            <div key={review._id} className="flex items-start">
              <div className="flex-none mr-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-gray-800">{review.userId.name}</span>
                </div>
                <div className="flex items-center mb-2">
                  {renderStars(review.rating)}
                  {/* <span className="text-gray-500 ml-2 text-sm">{review.timeAgo || "N/A"}</span> */}
                </div>
                <div className="text-gray-600">
                  {review.hasMore && !expandedReviews.has(review._id) 
                    ? `${review.comment.substring(0, 120)}...` 
                    : review.comment}
                  
                  {review.hasMore && (
                    <button 
                      onClick={() => toggleShowMore(review._id)}
                      className="text-[#49BBBD] hover:underline ml-1 text-sm font-medium"
                    >
                      {expandedReviews.has(review._id) ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">No reviews available for this course yet.</div>
      )}
      
      {reviews.length > 0 && (
        <div className="mt-8 text-center">
          <button className="px-6 py-2 border border-[#49BBBD] text-[#49BBBD] rounded hover:bg-[#49BBBD] hover:text-white transition-colors">
            Load more reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;