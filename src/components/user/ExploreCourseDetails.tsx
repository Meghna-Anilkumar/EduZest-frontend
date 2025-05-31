import React, { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Book, Clock, Star, ChevronDown, ChevronUp } from "lucide-react";
import { AppDispatch, RootState } from "../../redux/store";
import { getCourseByIdAction } from "../../redux/actions/courseActions";
import {
  enrollCourseAction,
  checkEnrollmentAction,
} from "../../redux/actions/enrollmentActions";
import {
  getActiveCouponsUserAction,
  checkCouponUsageAction,
} from "@/redux/actions/couponActions";
import { clearError } from "../../redux/reducers/courseReducer";
import CheckoutForm from "./CheckoutForm";
import ReviewsSection from "./ReviewsSection";

interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  expirationDate: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructorRef: { _id: string; name: string; profile: { profilePic: string } };
  categoryRef: { _id: string; categoryName: string };
  language: string;
  level: "beginner" | "intermediate" | "advanced";
  pricing: { type: "free" | "paid"; amount: number };
  thumbnail: string;
  thumbnailKey?: string;
  modules: Array<{
    moduleTitle: string;
    lessons: Array<{
      lessonNumber: string;
      title: string;
      description: string;
      objectives?: string[];
      video: string;
      videoKey: string;
      duration?: string;
    }>;
  }>;
  trial: { video?: string; videoKey?: string };
  attachments?: { title?: string; url?: string };
  isRequested: boolean;
  isBlocked: boolean;
  studentsEnrolled: number;
  isPublished: boolean;
  isRejected: boolean;
  createdAt: string;
  updatedAt: string;
  offer?: {
    discountPercentage: number;
    offerPrice: number;
    expirationDate?: string;
  };
}

interface HeaderProps {
  className?: string;
}

const Header = lazy(() =>
  import("../common/users/Header").then((module) => ({
    default: module.default as React.ComponentType<HeaderProps>,
  }))
);

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CourseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.course);
  const { isAuthenticated, userData } = useSelector(
    (state: RootState) => state.user
  );
  const [course, setCourse] = useState<Course | null>(null);
  const [activeSections, setActiveSections] = useState<number[]>([]);
  const [expandAll, setExpandAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [isCheckingEnrollment, setIsCheckingEnrollment] =
    useState<boolean>(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [tempSelectedCoupon, setTempSelectedCoupon] = useState<Coupon | null>(
    null
  );
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState<boolean>(false);

  const calculateFinalPrice = ({
    originalPrice,
    offer,
    coupon,
  }: {
    originalPrice: number;
    offer?: Course["offer"];
    coupon?: Coupon | null;
  }): number => {
    let price = originalPrice;

    const hasValidOffer =
      offer &&
      typeof offer === "object" &&
      offer.offerPrice !== undefined &&
      offer.offerPrice !== null &&
      !isNaN(offer.offerPrice) &&
      offer.offerPrice > 0 &&
      (!offer.expirationDate || new Date(offer.expirationDate) >= new Date());

    if (hasValidOffer) {
      price = offer.offerPrice;
    }

    if (coupon && new Date(coupon.expirationDate) >= new Date()) {
      if (
        coupon.minPurchaseAmount &&
        originalPrice < coupon.minPurchaseAmount
      ) {
        throw new Error(
          `This coupon requires a minimum purchase of ₹${coupon.minPurchaseAmount}.`
        );
      }

      let discount = (price * coupon.discountPercentage) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
      price = Math.max(0, price - discount);
    }

    return Math.round(price);
  };

  useEffect(() => {
    if (id) {
      dispatch(getCourseByIdAction(id)).then((action) => {
        if (getCourseByIdAction.fulfilled.match(action)) {
          setCourse(action.payload);
        }
      });

      dispatch(getActiveCouponsUserAction()).then((action) => {
        if (getActiveCouponsUserAction.fulfilled.match(action)) {
          setCoupons(action.payload);
        }
      });

      if (isAuthenticated) {
        setIsCheckingEnrollment(true);
        dispatch(checkEnrollmentAction(id))
          .then((action) => {
            if (checkEnrollmentAction.fulfilled.match(action)) {
              const { data } = action.payload;
              setIsEnrolled(data.isEnrolled);
            }
            setIsCheckingEnrollment(false);
          })
          .catch(() => {
            setIsCheckingEnrollment(false);
          });
      } else {
        setIsCheckingEnrollment(false);
      }
    }

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, id, isAuthenticated]);

  useEffect(() => {
    if (!course) {
      setFinalPrice(null);
      setDiscountedPrice(null);
      return;
    }

    try {
      const hasEmptyOffer =
        !course.offer ||
        (typeof course.offer === "object" &&
          Object.keys(course.offer).length === 0) ||
        (course.offer.offerPrice === undefined &&
          course.offer.discountPercentage === undefined);

      const finalPrice = calculateFinalPrice({
        originalPrice: course.pricing.amount,
        offer: hasEmptyOffer || course.pricing.type === "free" ? undefined : course.offer,
        coupon: selectedCoupon,
      });

      setFinalPrice(finalPrice);
      setDiscountedPrice(
        finalPrice < course.pricing.amount && course.pricing.type !== "free" ? finalPrice : null
      );
      setEnrollmentError(null);
    } catch (err: any) {
      console.error("Price calculation error:", err);
      setFinalPrice(course.pricing.amount);
      setDiscountedPrice(null);
      setEnrollmentError(
        err.message || "Failed to calculate price with coupon"
      );
    }
  }, [course, selectedCoupon]);

  const handleApplyCoupon = async () => {
    if (!tempSelectedCoupon) {
      setEnrollmentError("Please select a coupon to apply.");
      return;
    }

    setApplyingCoupon(true);
    try {
      const result = await dispatch(
        checkCouponUsageAction(tempSelectedCoupon._id)
      ).unwrap();
      if (result.success) {
        setSelectedCoupon(tempSelectedCoupon);
        setEnrollmentError(null);
      } else {
        setSelectedCoupon(null);
        setTempSelectedCoupon(null);
        setDiscountedPrice(null);
        setEnrollmentError(result.message || "Failed to apply coupon");
      }
    } catch (err: any) {
      console.error("Error applying coupon:", err);
      setSelectedCoupon(null);
      setTempSelectedCoupon(null);
      setDiscountedPrice(null);
      setEnrollmentError(
        err.message || "An error occurred while applying the coupon"
      );
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleTempCouponChange = (couponId: string) => {
    const coupon = coupons.find((c) => c._id === couponId) || null;
    setTempSelectedCoupon(coupon);
    setEnrollmentError(null);
  };

  const totalLessons = useMemo(
    () =>
      course?.modules.reduce((acc, module) => acc + module.lessons.length, 0) ||
      0,
    [course]
  );

  const totalDuration = useMemo(() => {
    if (!course) return 0;
    return course.modules.reduce((acc, module) => {
      const moduleDuration = module.lessons.reduce((lessonAcc, lesson) => {
        if (!lesson.duration) return lessonAcc;
        const durationMatch = lesson.duration.match(/(\d+)/);
        return lessonAcc + (durationMatch ? parseInt(durationMatch[1]) : 0);
      }, 0);
      return acc + moduleDuration;
    }, 0);
  }, [course]);

  const formattedDuration = useMemo(
    () => `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`,
    [totalDuration]
  );

  const totalModules = useMemo(() => course?.modules.length || 0, [course]);

  const formatModuleDuration = (lessons: Course["modules"][0]["lessons"]) => {
    const moduleDuration = lessons.reduce((acc, lesson) => {
      if (!lesson.duration) return acc;
      const durationMatch = lesson.duration.match(/(\d+)/);
      return acc + (durationMatch ? parseInt(durationMatch[1]) : 0);
    }, 0);
    return `${Math.floor(moduleDuration / 60)}h ${moduleDuration % 60}min`;
  };

  const toggleSection = (index: number) => {
    setActiveSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleAllSections = () => {
    if (expandAll) {
      setActiveSections([]);
    } else {
      setActiveSections(course?.modules.map((_, index) => index) || []);
    }
    setExpandAll(!expandAll);
  };

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setShowModal(true);
  };

  const handleGoToCourse = () => {
    navigate(`/student/learn/${course?._id}`);
  };

  const confirmEnrollment = async () => {
    setShowModal(false);
    setEnrollmentError(null);

    if (course?.pricing.type === "free") {
      try {
        const result = await dispatch(enrollCourseAction(course._id)).unwrap();
        if (result.success) {
          setIsEnrolled(true);
          navigate("/student/enrollment-success", { replace: true });
        } else {
          setEnrollmentError(
            result.message || "Failed to enroll in the free course"
          );
        }
      } catch (err: any) {
        console.error("Enrollment error:", err);
        setEnrollmentError(
          err.message || "An error occurred during enrollment"
        );
      }
    } else {
      if (
        course.offer &&
        typeof course.offer === "object" &&
        (course.offer.offerPrice === undefined ||
          course.offer.offerPrice === null) &&
        (course.offer.discountPercentage !== undefined ||
          course.offer.expirationDate !== undefined)
      ) {
        setEnrollmentError(
          "Invalid offer data for this course. Please contact support."
        );
        return;
      }
      setShowPaymentForm(true);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setIsEnrolled(true);
    navigate("/student/enrollment-success");
  };

  const isInstructor = userData?.role === "Instructor";

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!course)
    return (
      <div className="text-center py-10 text-gray-500">Course not found.</div>
    );

  return (
    <div className="flex flex-col min-h-screen">
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Enrollment</h2>
            <p className="mb-6">
              Are you sure you want to enroll in this course?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmEnrollment}
                className="px-4 py-2 bg-[#49BBBD] text-white rounded hover:bg-[#3a9a9c]"
              >
                Yes, Enroll
              </button>
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={<div>Loading...</div>}>
        <Header className="fixed top-0 left-0 right-0 z-50" />
      </Suspense>

      <div className="flex-grow">
        <div className="bg-gray-900 text-white pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="mb-4">
                {course.isPublished && course.studentsEnrolled > 0 && (
                  <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    Bestseller
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-gray-300 mb-4">{course.description}</p>
              <div className="flex items-center mb-4">
                <span className="text-yellow-400 font-bold mr-2">4.7</span>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < 4.7 ? "fill-yellow-400" : "fill-none"
                      }`}
                    />
                  ))}
                </div>
                <a href="#" className="ml-2 text-gray-400 hover:underline">
                  (430,621 ratings)
                </a>
                <span className="ml-2 text-gray-400">
                  {course.studentsEnrolled.toLocaleString()} students
                </span>
              </div>
              <p className="mb-2">
                Created by{" "}
                <a href="#" className="text-[#49BBBD] hover:underline">
                  {course.instructorRef?.name || "Unknown Instructor"}
                </a>
              </p>
              <div className="flex items-center text-gray-400 mb-4">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  Last updated {new Date(course.updatedAt).toLocaleDateString()}
                </span>
                <span className="ml-4 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5h18M3 12h18M3 19h18"
                    />
                  </svg>
                  {course.language}
                </span>
              </div>
            </div>
            <div className="lg:w-96">
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt="Course Preview"
                  className="w-full rounded-lg shadow-lg"
                />
                {course.trial?.videoKey && (
                  <video
                    controls
                    preload="metadata"
                    src={`/api/courses/${
                      course._id
                    }/stream?videoKey=${encodeURIComponent(
                      course.trial.videoKey
                    )}`}
                    className="w-full mt-4 rounded-lg"
                    onError={(e) =>
                      console.error("Trial video playback error:", e)
                    }
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  Lesson Objectives
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.modules.flatMap((module) =>
                    module.lessons.flatMap((lesson) =>
                      (lesson.objectives || []).map((obj, index) => (
                        <li
                          key={`${lesson.lessonNumber}-${index}`}
                          className="flex items-start"
                        >
                          <Book className="w-5 h-5 mr-2 mt-1 text-[#49BBBD]" />
                          <span>{obj}</span>
                        </li>
                      ))
                    )
                  )}
                </ul>
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Course Content</h2>
                  <button
                    onClick={toggleAllSections}
                    className="text-[#49BBBD] hover:underline text-sm font-medium"
                  >
                    {expandAll ? "Collapse all modules" : "Expand all modules"}
                  </button>
                </div>
                <div className="text-gray-600 text-sm mb-4">
                  {totalModules} sections • {totalLessons} lectures •{" "}
                  {formattedDuration} total length
                </div>
                <div className="border rounded-lg">
                  {course.modules.map((module, index) => (
                    <div key={index} className="border-b last:border-b-0">
                      <button
                        onClick={() => toggleSection(index)}
                        className="w-full flex justify-between items-center py-4 px-4 text-left hover:bg-gray-50 focus:outline-none"
                      >
                        <div className="flex items-center">
                          {activeSections.includes(index) ? (
                            <ChevronUp className="w-5 h-5 mr-2 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 mr-2 text-gray-600" />
                          )}
                          <span className="font-medium text-gray-800">
                            {module.moduleTitle}
                          </span>
                        </div>
                        <div className="text-gray-500 text-sm">
                          {module.lessons.length} lectures •{" "}
                          {formatModuleDuration(module.lessons)}
                        </div>
                      </button>
                      {activeSections.includes(index) && (
                        <div className="bg-gray-50 px-4 py-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lessonIndex}
                              className="flex justify-between items-center py-2 border-t first:border-t-0"
                            >
                              <div className="flex-1">
                                <span className="text-gray-700">
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="text-gray-500 text-sm">
                                {lesson.duration || "N/A"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:w-96">
              <div className="border rounded-lg p-4 shadow-lg bg-white -mt-32 lg:sticky lg:top-24">
                <div className="mb-4">
                  <span className="text-2xl font-bold text-[#49BBBD]">
                    {course.pricing.type === "free"
                      ? "Free"
                      : finalPrice !== null
                      ? `₹${finalPrice}`
                      : `₹${course.pricing.amount}`}
                  </span>
                  {discountedPrice !== null &&
                    discountedPrice < course.pricing.amount &&
                    course.pricing.type !== "free" && (
                      <div className="text-sm text-gray-500">
                        <span className="line-through">
                          ₹{course.pricing.amount}
                        </span>{" "}
                        {selectedCoupon
                          ? `(${selectedCoupon.discountPercentage}% off via coupon)`
                          : course.offer &&
                            (!course.offer.expirationDate ||
                              new Date(course.offer.expirationDate) >= new Date())
                          ? `(${course.offer.discountPercentage}% off)`
                          : ""}
                      </div>
                    )}
                  {course.offer?.expirationDate &&
                    new Date(course.offer.expirationDate) >= new Date() &&
                    course.pricing.type !== "free" && (
                      <div className="text-xs text-gray-500 mt-1">
                        Offer valid until{" "}
                        {new Date(
                          course.offer.expirationDate
                        ).toLocaleDateString()}
                      </div>
                    )}
                </div>
                {course.pricing.type !== "free" &&
                  !isEnrolled &&
                  !isInstructor && (
                    <div className="mb-4">
                      <label
                        htmlFor="coupon"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Select Coupon
                      </label>
                      <div className="flex gap-2">
                        <select
                          id="coupon"
                          value={tempSelectedCoupon?._id || ""}
                          onChange={(e) =>
                            handleTempCouponChange(e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm"
                        >
                          <option value="">Select a coupon</option>
                          {coupons.length > 0 ? (
                            coupons.map((coupon) => (
                              <option key={coupon._id} value={coupon._id}>
                                {coupon.code} ({coupon.discountPercentage}% off,
                                expires{" "}
                                {new Date(
                                  coupon.expirationDate
                                ).toLocaleDateString()}
                                )
                              </option>
                            ))
                          ) : (
                            <option disabled>No coupons available</option>
                          )}
                        </select>
                        <button
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon || !tempSelectedCoupon}
                          className={`mt-1 px-4 py-2 bg-[#49BBBD] text-white rounded hover:bg-[#3a9a9c] text-sm ${
                            applyingCoupon || !tempSelectedCoupon
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {applyingCoupon ? "Applying..." : "Apply"}
                        </button>
                      </div>
                    </div>
                  )}
                {enrollmentError && (
                  <div className="text-red-500 text-sm mb-4">
                    {enrollmentError}
                  </div>
                )}
                {isEnrolled && (
                  <div className="text-green-500 text-sm mb-4">
                    You are already enrolled in this course!
                  </div>
                )}
                {showPaymentForm && course ? (
                  <Elements stripe={stripePromise}>
                    <CheckoutForm
                      course={{
                        ...course,
                        pricing: {
                          ...course.pricing,
                          amount:
                            finalPrice !== null
                              ? finalPrice
                              : course.pricing.amount,
                        },
                      }}
                      finalPrice={
                        finalPrice !== null ? finalPrice : course.pricing.amount
                      }
                      onSuccess={handlePaymentSuccess}
                      couponId={selectedCoupon?._id}
                    />
                  </Elements>
                ) : isEnrolled ? (
                  <button
                    onClick={handleGoToCourse}
                    className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                  >
                    Go to Course
                  </button>
                ) : !isInstructor ? (
                  <button
                    onClick={handleEnrollClick}
                    disabled={isCheckingEnrollment}
                    className={`w-full py-2 rounded text-white ${
                      isCheckingEnrollment
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#49BBBD] hover:bg-[#3a9a9c]"
                    }`}
                  >
                    {isCheckingEnrollment ? "Checking..." : "Enroll Now"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Student Feedback
            </h2>
            <ReviewsSection courseId={course._id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;