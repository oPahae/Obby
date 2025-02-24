import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import axios from "axios";
import Link from "next/link";
import { verifyAuth } from "../middlewares/auth";

export default function Forgot() {
  const [step, setStep] = useState(0);
  const formRef = useRef(null);
  const verifyBtnRef = useRef(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState(Array(6).fill(""));
  const [password, setPassword] = useState({ newPassword: "", confirmPassword: "" });

  // Timer state
  const [timer, setTimer] = useState(300); // 5 minutes in seconds

  // Update the timer
  useEffect(() => {
    let interval;
    if (step === 1 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleNext = async () => {
    if (step === 0 && !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);

    if (step === 0) {
      setSendCodeLoading(true);
      try {
        const response = await axios.post("/api/auth/sendCode", { email });
        console.log(response.data.message);
        setTimer(300);
        setTimeout(() => {
          setSendCodeLoading(false);
        }, 1000);
      } catch (err) {
        setSendCodeLoading(false);
        setError(err.response?.data?.message || "An error occurred");
        return;
      }
    }

    if (formRef.current) {
      gsap.to(formRef.current, {
        x: "-100%",
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          setStep((prev) => prev + 1);
          gsap.set(formRef.current, { x: "0%", opacity: 1 });
        },
      });
    }
  };

  const handleVerifyCode = async () => {
    if (code.join("").length < 6) {
      setError("Please enter a complete 6-digit code.");
      return;
    }

    try {
      const response = await axios.post("/api/auth/verifyCode", { email, code: code.join("") });
      setSuccess("Code verified! Please set your new password.");
      setStep((prev) => prev + 1);
    } catch (err) {
      setError("Incorrect code. Please try again.");
    }
  };

  const handleSavePassword = async () => {
    if (password.newPassword !== password.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await axios.post("/api/auth/resetPassword", { email, password: password.newPassword });
      setSuccess("Password reset successfully! You can now log in.");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    }
  };

  const handleCodeInput = (value, index) => {
    const updatedCode = [...code];
    updatedCode[index] = value.slice(-1);
    setCode(updatedCode);

    if (value && index < 5) {
      document.getElementById(`code-input-${index + 1}`).focus();
    }
  };

  const progress = Math.round(((step + 1) / 3) * 100);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, x: "100%" },
        { opacity: 1, x: "0%", duration: 0.5 }
      );
    }
  }, [step]);

  // Format the timer in MM:SS format
  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-violet-500 to-blue-600 p-6">
      <div className="relative w-full max-w-md bg-white p-8 rounded-xl shadow-lg overflow-hidden">
        {/* Smooth Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div ref={formRef} className="relative">
          {error && (
            <p className="text-red-500 text-center mb-4">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-500 text-center mb-4">
              {success}
            </p>
          )}

          {step === 0 && (
            <>
              <h1 className="text-xl font-bold text-center mb-6">
                Enter your email
              </h1>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                className="w-full mt-6 p-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition hover:rotate-2"
                onClick={handleNext}
              >
                {!sendCodeLoading ? "Send Code" : <div className="flex justify-center"><div className="w-8 h-8 border-4 border-white border-dashed rounded-full animate-spin"></div></div>}
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-xl font-bold text-center mb-6">
                Enter Verification Code
              </h1>
              <p className="text-gray-500 text-center mb-4">
                Expires after: <span className="font-bold">{formatTimer(timer)}</span>
              </p>
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-input-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeInput(e.target.value, index)}
                    className="w-12 h-12 text-center text-xl border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition focus:rotate-3 focus:scale-105"
                    autoComplete="off"
                  />
                ))}
              </div>
              <button
                ref={verifyBtnRef}
                className="w-full mt-6 p-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition hover:rotate-2"
                onClick={handleVerifyCode}
              >
                Verify Code
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-xl font-bold text-center mb-6">
                Set New Password
              </h1>
              <input
                type="password"
                placeholder="New Password"
                value={password.newPassword}
                onChange={(e) =>
                  setPassword((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={password.confirmPassword}
                onChange={(e) =>
                  setPassword((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                className="w-full p-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition hover:-rotate-2"
                onClick={handleSavePassword}
              >
                Save
              </button>
            </>
          )}
          <div className="text-center mt-4">
            <Link href="/Login" className="text-violet-600 hover:underline">
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res);

  if (user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: { title: '...', content: '...' } }
}