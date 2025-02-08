import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { verifyOTP } from "../../redux/actions/auth/verifyOtpAction";
import { RootState, AppDispatch } from "../../redux/store";
import { userClearError } from "../../redux/reducers/userReducer";
import { resendOtpThunk } from "../../redux/actions/userActions";

const OTP_TIMER_SECONDS = 120; // 2 minutes

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OTP_TIMER_SECONDS);
  const timerRef = useRef<number | undefined>(undefined);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { otpVerified, error, tempMail } = useSelector(
    (state: RootState) => state.user
  );
  console.log(otpVerified)
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Format time left into minutes and seconds
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Initialize and handle timer
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    setTimeLeft(OTP_TIMER_SECONDS);
    setIsOtpExpired(false);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
          }
          setIsOtpExpired(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (error) {
      setOtp(Array(6).fill(""));
      firstInputRef.current?.focus();
      setIsSubmitting(false);

      if (error.message?.toLowerCase().includes("expired")) {
        setIsOtpExpired(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setTimeLeft(0);
      }
    }
  }, [error]);

  useEffect(() => {
    if (otpVerified) {
      navigate("/");
    }
  }, [otpVerified, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    if (/^[0-9]$/.test(value) || value === "") {
      if (error) {
        dispatch(userClearError());
      }

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < 5) {
        const nextInput = document.getElementById(
          `otp-input-${index + 1}`
        ) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.getElementById(
        `otp-input-${index - 1}`
      ) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!tempMail) {
      console.error("Email is missing! Cannot verify OTP without an email.");
      setIsSubmitting(false);
      return;
    }

    try {
      const otpString = otp.join("");
      if (otpString.length !== 6) {
        throw new Error("Please enter all 6 digits");
      }

      const otpNumber = parseInt(otpString, 10);
      await dispatch(
        verifyOTP({
          otp: otpNumber,
          email: tempMail.email,
        })
      ).unwrap();
    } catch {
      setOtp(Array(6).fill(""));
      firstInputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
        setIsSubmitting(true);
        if (!tempMail?.email) {
            console.error("Email is missing! Cannot resend OTP.");
            return;
        }
        
        await dispatch(resendOtpThunk(tempMail.email)).unwrap();

        startTimer(); 
        setOtp(Array(6).fill(""));
    } catch (error) {
        console.error("Failed to resend OTP:", error);
    } finally {
        setIsSubmitting(false);
    }
};


  return (
    <div className="bg-gradient-to-r from-[#49bbbd] via-gray-400 to-white flex items-center justify-center min-h-screen">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-xs md:max-w-md w-full">
        <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-6">
          Verify Your OTP
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Enter the 6-digit OTP sent to your email.
        </p>
        <div className="text-center mb-4">
          <span
            className={`font-medium ${
              timeLeft < 30 ? "text-red-500" : "text-gray-600"
            }`}
          >
            OTP Expires in: {formatTimeLeft()}
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-2 justify-center mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                ref={index === 0 ? firstInputRef : null}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={isSubmitting || isOtpExpired}
                className={`w-10 h-10 md:w-12 md:h-12 border ${
                  error ? "border-red-500" : "border-gray-300"
                } rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 ${
                  error ? "focus:ring-red-500" : "focus:ring-[#49bbbd]"
                } transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
            ))}
          </div>
          {error && (
            <div className="text-center text-red-500 mb-4 -mt-2">
              {error.message || "Invalid OTP. Please try again."}
            </div>
          )}
          {isOtpExpired ? (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isSubmitting}
              className="w-full bg-[#49bbbd] text-white py-2 md:py-3 rounded-lg font-semibold hover:bg-[#41a7a7] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Resend OTP"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || isOtpExpired}
              className="w-full bg-[#49bbbd] text-white py-2 md:py-3 rounded-lg font-semibold hover:bg-[#41a7a7] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;
