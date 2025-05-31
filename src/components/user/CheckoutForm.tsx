import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { AppDispatch } from "../../redux/store";
import {
  createPaymentIntentAction,
  confirmPaymentAction,
} from "../../redux/actions/enrollmentActions";

interface Course {
  _id: string;
  title: string;
  pricing: { type: "free" | "paid"; amount: number };
  offer?: {
    discountPercentage: number;
    offerPrice: number;
    expirationDate?: string;
  };
  description?: string;
  instructorRef?: { _id: string; name: string; profile: { profilePic: string } };
  categoryRef?: { _id: string; categoryName: string };
  language?: string;
  level?: "beginner" | "intermediate" | "advanced";
  thumbnail?: string;
  thumbnailKey?: string;
  modules?: Array<{
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
  trial?: {
    video?: string;
    videoKey?: string;
  };
  attachments?: { title?: string; url?: string };
  isRequested?: boolean;
  isBlocked?: boolean;
  studentsEnrolled?: number;
  isPublished?: boolean;
  isRejected?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CheckoutFormProps {
  course: Course;
  onSuccess: () => void;
  couponId?: string;
  finalPrice: number;
}


const CheckoutForm: React.FC<CheckoutFormProps> = ({
  course,
  onSuccess,
  couponId,
  finalPrice,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch<AppDispatch>();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Log the received props for debugging
  console.log("CheckoutForm received props:", { course, finalPrice, couponId });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe has not loaded correctly. Please try again.");
      return;
    }

    // Validate finalPrice
    if (finalPrice === undefined || finalPrice === null || isNaN(finalPrice) || finalPrice <= 0) {
      setError("Invalid course price. Please contact support.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log("Initiating payment for course:", {
        courseId: course._id,
        amount: finalPrice,
        couponId,
      });

      // Step 1: Create payment intent with the correctly calculated amount
      const response = await dispatch(
        createPaymentIntentAction({
          courseId: course._id,
          amount: finalPrice,
          paymentType: "credit",
          couponId,
        })
      ).unwrap();

      if (!response.success) {
        throw new Error(response.message || "Failed to create payment intent");
      }

      const { clientSecret, paymentId } = response.data;
      console.log("Payment intent created:", { paymentId, clientSecret });

      // Step 2: Confirm the payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found.");
      }

      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (paymentResult.error) {
        console.error("Stripe payment error:", paymentResult.error);
        setError(paymentResult.error.message || "Payment failed");
        setProcessing(false);
        return;
      }

      if (paymentResult.paymentIntent?.status === "succeeded") {
        console.log("Payment succeeded, confirming on backend:", { paymentId });

        // Step 3: Confirm payment on the backend
        const confirmResult = await dispatch(
          confirmPaymentAction(paymentId)
        ).unwrap();

        if (confirmResult.success) {
          console.log("Payment confirmed successfully");
          onSuccess();
        } else {
          setError(confirmResult.message || "Failed to confirm payment");
        }
      } else {
        setError("Payment confirmation failed. Please try again.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred during payment";
      console.error("Payment error:", err);
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded bg-gray-50">
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
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className={`w-full py-2 rounded text-white ${
          processing || !stripe || !elements
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#49BBBD] hover:bg-[#3a9a9c]"
        }`}
      >
        {processing
          ? "Processing..."
          : `Pay ₹${(finalPrice ?? 0).toLocaleString("en-IN")}`}
      </button>
    </form>
  );
};

export default CheckoutForm;