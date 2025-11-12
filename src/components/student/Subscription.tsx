import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  createSubscriptionAction,
  confirmSubscriptionAction,
  getSubscriptionStatus,
} from "../../redux/actions/subscriptionActions";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import StudentSidebar from "./StudentSidebar";
import Header from "../common/users/Header";
import { toast } from "react-toastify";
import { fetchUserData } from "@/redux/actions/auth/fetchUserdataAction";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Plan {
  name: string;
  value: "monthly" | "yearly";
  price: number;
  period: string;
  features: string[];
  color: string;
  textColor: string;
  isPopular?: boolean;
}

// Loading Spinner Component
const LoadingSpinner: React.FC<{
  size?: "sm" | "md" | "lg";
  color?: string;
}> = ({ size = "md", color = "text-white" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`${sizeClasses[size]} ${color} animate-spin`}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

interface SubscriptionCheckoutFormProps {
  userId: string;
  plan: "monthly" | "yearly";
  onClose: () => void;
  onSuccess: () => void;
}

const SubscriptionCheckoutForm: React.FC<SubscriptionCheckoutFormProps> = ({
  userId,
  plan,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      setError("Stripe is not loaded. Please refresh and try again.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found. Please refresh and try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create subscription
      console.log("Creating subscription...");
      const createResult = await dispatch(
        createSubscriptionAction({
          userId,
          plan,
          paymentType: "credit",
        })
      ).unwrap();

      if (!createResult.success) {
        setError(createResult.message || "Failed to create subscription");
        setLoading(false);
        return;
      }

      const { clientSecret, subscriptionId: newSubscriptionId } = createResult.data;

      if (!clientSecret) {
        setError("Invalid payment configuration. Please contact support.");
        setLoading(false);
        return;
      }

      // Step 2: Confirm payment
      console.log("Confirming payment...");
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: cardElement },
        }
      );

      if (stripeError) {
        console.error("Stripe payment error:", stripeError);
        setError(stripeError.message || "Payment failed. Please check your card details.");
        setLoading(false);
        return;
      }

      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        setError("Payment was not completed. Please try again.");
        setLoading(false);
        return;
      }

      // Step 3: Confirm subscription on backend
      console.log("Confirming subscription on backend...");
      const confirmResult = await dispatch(
        confirmSubscriptionAction(newSubscriptionId)
      ).unwrap();

      if (confirmResult.success) {
        // Refresh user data
        await dispatch(fetchUserData()).unwrap();
        
        toast.success("Subscription activated successfully!");
        onSuccess();
        onClose();
      } else {
        setError(confirmResult.message || "Failed to activate subscription");
      }
    } catch (err: any) {
      console.error("Subscription error:", err);
      setError(
        err.message || 
        "An unexpected error occurred. Please try again or contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          Subscribe to {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4 p-4 border border-gray-300 rounded">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": { color: "#aab7c4" },
                  },
                  invalid: { color: "#9e2146" },
                },
              }}
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || loading}
              className="px-4 py-2 bg-[#49bbbd] text-white rounded hover:bg-[#3a9a9c] disabled:bg-gray-400 flex items-center gap-2 min-w-[140px] justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Processing...</span>
                </>
              ) : (
                "Confirm Payment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubscriptionPlans: React.FC = () => {
  const [activeTab] = useState("Subscription");
  const dispatch = useDispatch<AppDispatch>();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | null>(
    null
  );
  const [hasActiveSubscription, setHasActiveSubscription] =
    useState<boolean>(false);
  const [activePlan, setActivePlan] = useState<"monthly" | "yearly" | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const userData = useSelector((state: RootState) => state.user.userData);
  const userId = userData?._id;

  const fetchSubscriptionStatus = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await dispatch(getSubscriptionStatus(userId)).unwrap();
      if (result.success) {
        setHasActiveSubscription(result.data?.hasActiveSubscription || false);
        setActivePlan(
          result.data?.hasActiveSubscription ? result.data.plan : null
        );
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch subscription status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSubscriptionStatus();
    }
  }, [userId]); 
  const plans: Plan[] = [
    {
      name: "Monthly",
      value: "monthly",
      price: 299,
      period: "month",
      features: [
        'Unlock Access To Exams And Leaderboard'
      ],
      color: "bg-gray-200",
      textColor: "text-gray-800",
    },
    {
      name: "Annual",
      value: "yearly",
      price: 2499,
      period: "year",
      features: [
       'Unlock Access To Exams And Leaderboard'
      ],
      color: "bg-[#49bbbd]",
      textColor: "text-white",
      isPopular: true,
    },
  ];

  const handleChoosePlan = (planValue: string) => {
    if (!userId) {
      toast.error("Please log in to subscribe to a plan.");
      return;
    }
    setSelectedPlan(planValue as "monthly" | "yearly");
  };

  const closeModal = () => {
    setSelectedPlan(null);
  };

  // Show loading spinner while fetching subscription status
  if (loading && !hasActiveSubscription && !activePlan) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <div className="flex flex-1">
          <div className="hidden md:block w-64 border-r fixed left-0 top-0 h-full z-10">
            <StudentSidebar activeTab={activeTab} setActiveTab={() => {}} />
          </div>
          <div className="flex-1 md:pl-64 mt-20 md:mt-24 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <LoadingSpinner size="lg" color="text-[#49bbbd]" />
                {/* <p className="mt-4 text-gray-600">Loading subscription plans...</p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <div className="hidden md:block w-64 border-r fixed left-0 top-0 h-full z-10">
          <StudentSidebar activeTab={activeTab} setActiveTab={() => {}} />
        </div>

        <div className="flex-1 md:pl-64 mt-20 md:mt-24 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-black">
                Subscription Plans
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Choose a plan that works best for your success.
              </p>
              {hasActiveSubscription && activePlan && (
                <p className="text-green-600 mt-2">
                  You have an active{" "}
                  {activePlan.charAt(0).toUpperCase() + activePlan.slice(1)}{" "}
                  subscription.
                </p>
              )}
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => {
                const isActivePlan =
                  hasActiveSubscription && activePlan === plan.value;

                return (
                  <div
                    key={index}
                    className={`relative rounded-2xl shadow-lg p-8 ${plan.color} transform transition-all duration-300 hover:scale-105 border border-gray-300`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black text-sm font-bold px-4 py-1 rounded-full">
                        POPULAR
                      </div>
                    )}

                    <h2 className={`text-2xl font-bold mb-4 ${plan.textColor}`}>
                      {plan.name}
                    </h2>

                    <div
                      className={`text-4xl font-bold mb-6 ${plan.textColor}`}
                    >
                      ₹{plan.price}
                      <span className={`text-lg font-normal ${plan.textColor}`}>
                        /{plan.period}
                      </span>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-yellow-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className={plan.textColor}>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleChoosePlan(plan.value)}
                      disabled={hasActiveSubscription}
                      className={`w-full font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                        hasActiveSubscription
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#49bbbd] text-white hover:bg-[#3a9a9c]"
                      }`}
                    >
                      {isActivePlan ? "Active Plan" : "Choose Plan →"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedPlan && userId && !hasActiveSubscription && (
        <Elements stripe={stripePromise}>
          <SubscriptionCheckoutForm
            userId={userId}
            plan={selectedPlan}
            onClose={closeModal}
            onSuccess={fetchSubscriptionStatus}
          />
        </Elements>
      )}
    </div>
  );
};

export default SubscriptionPlans;