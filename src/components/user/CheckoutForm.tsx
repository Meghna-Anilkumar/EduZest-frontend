import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { AppDispatch } from "../../redux/store";
import {
  createPaymentIntentAction,
  confirmPaymentAction,
} from "../../redux/actions/courseActions";

// Course interface
interface Course {
  _id: string;
  title: string;
  pricing: { type: "free" | "paid"; amount: number };
}

interface CheckoutFormProps {
  course: Course;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ course, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create payment intent
      const response = await dispatch(
        createPaymentIntentAction({
          courseId: course._id,
          amount: course.pricing.amount,
          paymentType: "credit",
        })
      ).unwrap();

      if (!response.success) {
        throw new Error(response.message || "Failed to create payment intent");
      }

      const { clientSecret, paymentId } = response.data;

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement! },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message || "Payment failed");
        setProcessing(false);
        return;
      }

      // Step 3: Confirm payment on backend
      const confirmResult = await dispatch(
        confirmPaymentAction(paymentId)
      ).unwrap();

      if (confirmResult.success) {
        onSuccess();
      } else {
        setError(confirmResult.message || "Failed to confirm payment");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during payment"
      );
      console.error("Payment error:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-2 border rounded">
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
        disabled={!stripe || processing}
        className="w-full bg-[#49BBBD] text-white py-2 rounded hover:bg-[#3a9a9c] disabled:opacity-50"
      >
        {processing ? "Processing..." : `Pay ₹${course.pricing.amount}`}
      </button>
    </form>
  );
};

export default CheckoutForm;