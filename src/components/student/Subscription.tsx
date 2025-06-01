import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { createSubscriptionAction, confirmSubscriptionAction } from "../../redux/actions/subscriptionActions";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import StudentSidebar from "./StudentSidebar";
import Header from "../common/users/Header";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Plan {
  name: string;
  price: number;
  period: string;
  features: string[];
  color: string;
  textColor: string;
  isPopular?: boolean;
}

const SubscriptionCheckoutForm: React.FC<{
  userId: string;
  plan: "monthly" | "yearly";
  onClose: () => void;
}> = ({ userId, plan, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create the subscription
      const createResult = await dispatch(
        createSubscriptionAction({
          userId,
          plan,
          paymentType: "credit", // Assuming credit card payment
        })
      ).unwrap();

      if (!createResult.success) {
        setError(createResult.message);
        setLoading(false);
        return;
      }

      const { clientSecret, subscriptionId: newSubscriptionId } = createResult.data;
      setSubscriptionId(newSubscriptionId);

      // Step 2: Confirm the payment with Stripe Elements
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });

      if (result.error) {
        setError(result.error.message || "Payment failed");
        setLoading(false);
        return;
      }

      // Step 3: Confirm the subscription
      const confirmResult = await dispatch(
        confirmSubscriptionAction(newSubscriptionId)
      ).unwrap();

      if (confirmResult.success) {
        alert("Subscription successful!");
        onClose();
      } else {
        setError(confirmResult.message);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Subscribe to {plan} Plan</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
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
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || loading}
              className="px-4 py-2 bg-[#49bbbd] text-white rounded hover:bg-[#3a9a9c]"
            >
              {loading ? "Processing..." : "Confirm Payment"}
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
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | null>(null);

  // Retrieve userId from Redux state
  const userData = useSelector((state: RootState) => state.user.userData);
  const userId = userData?._id;

  const plans: Plan[] = [
    {
      name: "Monthly",
      price: 299,
      period: "month",
      features: [
        "Get started with messaging",
        "Flexible team meetings",
        "5 TB cloud storage",
      ],
      color: "bg-gray-200",
      textColor: "text-gray-800",
    },
    {
      name: "Annual",
      price: 2499,
      period: "year",
      features: [
        "All features in Monthly",
        "Flexible call scheduling",
        "15 TB cloud storage",
      ],
      color: "bg-[#49bbbd]",
      textColor: "text-white",
      isPopular: true,
    },
  ];

  const handleChoosePlan = (planName: string) => {
    // Only allow selecting a plan if userId is available
    if (!userId) {
      alert("Please log in to subscribe to a plan.");
      return;
    }
    setSelectedPlan(planName.toLowerCase() as "monthly" | "yearly");
  };

  const closeModal = () => {
    setSelectedPlan(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1">
        {/* Desktop Sidebar (Fixed as Provided) */}
        <div className="hidden md:block w-64 border-r fixed left-0 top-0 h-full z-10">
          <StudentSidebar activeTab={activeTab} setActiveTab={() => {}} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 md:pl-64 mt-20 md:mt-24 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-black">Subscription Plans</h1>
              <p className="text-lg text-gray-600 mt-2">
                Choose a plan that works best for your success.
              </p>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative rounded-2xl shadow-lg p-8 ${plan.color} transform transition-all duration-300 hover:scale-105 border border-gray-300`}
                >
                  {/* Popular Tag */}
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black text-sm font-bold px-4 py-1 rounded-full">
                      POPULAR
                    </div>
                  )}

                  {/* Plan Name */}
                  <h2 className={`text-2xl font-bold mb-4 ${plan.textColor}`}>
                    {plan.name}
                  </h2>

                  {/* Price */}
                  <div className={`text-4xl font-bold mb-6 ${plan.textColor}`}>
                    ₹{plan.price}
                    <span className={`text-lg font-normal ${plan.textColor}`}>
                      /{plan.period}
                    </span>
                  </div>

                  {/* Features */}
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

                  {/* Button */}
                  <button
                    onClick={() => handleChoosePlan(plan.name)}
                    className="w-full bg-[#49bbbd] text-white font-bold py-3 rounded-lg hover:bg-[#3a9a9c] transition-all duration-300"
                  >
                    Choose Plan →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Payment Modal */}
      {selectedPlan && userId && (
        <Elements stripe={stripePromise}>
          <SubscriptionCheckoutForm
            userId={userId}
            plan={selectedPlan}
            onClose={closeModal}
          />
        </Elements>
      )}
    </div>
  );
};

export default SubscriptionPlans;