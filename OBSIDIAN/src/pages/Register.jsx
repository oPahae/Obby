import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import axios from "axios";
import { verifyAuth } from "../middlewares/auth";

export default function Register() {
  const [step, setStep] = useState(0);
  const formRef = useRef(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
    sex: "",
    country: "",
  });

  const steps = [
    { label: "Choose a Username", field: "username", type: "text", required: true },
    { label: "Enter Your Email", field: "email", type: "email", required: true },
    { label: "Choose a Password", field: "password", type: "password", required: true },
    { label: "Your Age (optional)", field: "age", type: "number", required: false },
    { label: "Boy or Girl?", field: "sex", type: "select", required: true, options: ["", "Boy", "Girl"] },
    { label: "Where are you from? (optional)", field: "country", type: "text", required: false },
  ];

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [step]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && step < steps.length - 1) handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, formData]);

  const handleNext = () => {
    const currentStep = steps[step];
    const value = formData[currentStep.field];

    if (currentStep.required && !value.trim()) {
      setError(`Please fill in the "${currentStep.label}" field.`);
      return;
    }

    if (currentStep.field === "email" && !value.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);

    if (formRef.current) {
      gsap.to(formRef.current, {
        x: "-100%",
        opacity: 0,
        duration: 0.5,
        onComplete: () => setStep((prev) => prev + 1),
      });
    }
  };

  const handlePrevious = () => {
    if (formRef.current) {
      gsap.to(formRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.5,
        onComplete: () => setStep((prev) => prev - 1),
      });
    }
  };

  const handleSubmit = async () => {
    const currentStep = steps[step];
    const value = formData[currentStep.field];

    if (currentStep.required && !value.trim()) {
      setError(`Please fill in the "${currentStep.label}" field.`);
      return;
    }

    if (currentStep.field === "email" && !value.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await axios.post("/api/auth/register", formData);
      setSuccess(response.data.message);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const currentStep = steps[step];
  const progress = Math.round(((step + 1) / steps.length) * 100);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-violet-500 to-blue-600 p-6">
      <div className="relative w-full max-w-md bg-white p-8 rounded-xl shadow-lg overflow-hidden transition-all">
        {/* Smooth Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className=" bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div ref={formRef} className="relative">
          <h1 className="text-xl font-bold text-center mb-6">{currentStep.label}</h1>

          {error && (
            <p className="text-red-500 text-center mb-4 transition-all">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-500 text-center mb-4 transition-all">
              {success}
            </p>
          )}

          {currentStep.type === "select" ? (
            <select
              value={formData[currentStep.field]}
              onChange={(e) => handleChange(currentStep.field, e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {currentStep.options.map((option, index) => (
                <option key={index} value={option}>
                  {option || "Choose"}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={currentStep.type}
              value={formData[currentStep.field]}
              onChange={(e) => handleChange(currentStep.field, e.target.value)}
              required={currentStep.required}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          )}

          <div className="flex justify-between mt-6">
            {step > 0 && (
              <button
                className="p-3 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={handlePrevious}
              >
                Previous
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                className="p-3  bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg hover:bg-purple-700"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button
                className="p-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                onClick={handleSubmit}
              >
                Submit
              </button>
            )}
          </div>
        </div>
        <div className="text-center mt-4">
          <Link href="/Login" className="text-violet-600 hover:underline">
            Already have an account?
          </Link>
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