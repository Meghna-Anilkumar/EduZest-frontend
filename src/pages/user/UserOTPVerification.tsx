import React, { useState, useEffect, useRef } from "react";
import {toast} from 'react-toastify'
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTP } from "../../redux/actions/auth/verifyOtpAction";
import { RootState, AppDispatch } from "../../redux/store";
import { userClearError } from "../../redux/reducers/userReducer";
import { resendOtpThunk } from "../../redux/actions/userActions";

const OTP_TIMER_SECONDS = 120; 

const UserOTPVerification: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OTP_TIMER_SECONDS);
  const timerRef = useRef<number | undefined>(undefined);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const { error, tempMail,isAuthenticated } = useSelector((state: RootState) => state.user);
  if(isAuthenticated){
    navigate('/login')
  }
  const userEmail = location.state?.email || tempMail?.email; 
  const firstInputRef = useRef<HTMLInputElement>(null);

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

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
          clearInterval(timerRef.current);
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
        clearInterval(timerRef.current);
        setTimeLeft(0);
      }
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === "") {
      if (error) {
        dispatch(userClearError());
      }

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!userEmail) {
      console.error("Email is missing! Cannot verify OTP.");
      setIsSubmitting(false);
      return;
    }

    try {
      const otpString = otp.join("");
      if (otpString.length !== 6) {
        throw new Error("Please enter all 6 digits");
      }

      const otpNumber = parseInt(otpString, 10);
      const response = await dispatch(
        verifyOTP({
          otp: otpNumber,
          email: userEmail,
        })
      ).unwrap();

      console.log("OTP Verification Response:", response);
      toast.success('otp verified successfully')
      if (response?.redirectURL) {
        navigate(response.redirectURL,{ state: { userEmail }});
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      setOtp(Array(6).fill(""));
      firstInputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsSubmitting(true);
      if (!userEmail) {
        console.error("Email is missing! Cannot resend OTP.");
        return;
      }

      await dispatch(resendOtpThunk(userEmail)).unwrap();
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

        {/* Error message */}
        {error && (
          <div className="text-center text-red-500 mb-4 -mt-2">
            {error.message || "Invalid OTP. Please try again."}
          </div>
        )}

        {/* Timer */}
        <div className="text-center mb-4">
          <span className={`font-medium ${timeLeft < 30 ? "text-red-500" : "text-gray-600"}`}>
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
                className="w-10 h-10 md:w-12 md:h-12 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#49bbbd] transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            ))}
          </div>

          {/* Verify OTP Button */}
          {!isOtpExpired ? (
            <button type="submit" className="w-full bg-[#49bbbd] text-white py-2 md:py-3 rounded-lg font-semibold hover:bg-[#41a7a7] transition duration-200">
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>
          ) : (
            <button type="button" onClick={handleResendOTP} className="w-full bg-[#49bbbd] text-white py-2 md:py-3 rounded-lg font-semibold hover:bg-[#41a7a7] transition duration-200">
              {isSubmitting ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserOTPVerification;
