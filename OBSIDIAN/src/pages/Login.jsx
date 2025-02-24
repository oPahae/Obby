import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import GoogleLoginBtn from "../components/GoogleLoginBtn";
import { verifyAuth } from "../middlewares/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large" }
      );
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/auth/login", { username, password });
      if(response.status === 200)
        window.location.href = "/"
      else
        alert("Error")
    } catch (err) {
      setError(err.response?.data?.message || "Username or password incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      const { data } = await axios.post("/api/auth/googleLogin", {
        token: response.credential,
      });
      window.location.href = "/"
    } catch (err) {
      setError("Google authentication failed");
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600 p-6">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          LOGIN
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block mb-2 text-gray-600">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-gray-600">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 text-white font-bold rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:rotate-2 transition"
        >
          {loading ? "Loading..." : "LOGIN"}
        </button>
        <br />

        <div className="w-full flex items-center justify-center gap-3">
          <hr className="flex-grow border-t border-gray-300" />
          <p className="text-gray-400 font-semibold whitespace-nowrap">Or</p>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <GoogleLoginBtn onLoginSuccess={handleCredentialResponse} />

        <Link href="/Register" className="w-full flex justify-center text-violet-600 hover:underline">
          You don't have an account?
        </Link>
        <Link href="/Forgot" className="w-full flex justify-center text-violet-600 hover:underline">
          Forgot password?
        </Link>
      </form>
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