import React, { useState } from "react";
import { login } from "./utils/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    try {
      e.preventDefault();
      setError("");

      if (!email || !password) {
        setError("Molimo unesite ad i lozinku.");
        return;
      }

      const response = await login({ username: email, password });
      console.log(response.detail)

      if (response?.username) {
        navigate("/");
      } else {
        setError(typeof response.detail === "string" ? response.detail : "Došlo je do greške.")
      }
    } catch (err) {
        console.log(err)
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex justify-center overflow-hidden">
      {/* <button
        onClick={handleBackLogin}
        className="absolute top-8 left-8 z-50 px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-full shadow-lg text-lg font-bold hover:scale-105 transition-all"
      >
        NAZAD
      </button> */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-60">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div
            className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        <div className="z-50 flex items-start mb-6">
          <img src="logo4s.png" alt="Logo" className="w-[400px] h-[200px]" />
        </div>
        <h1 className="text-5xl text-center font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-2xl p-4">
          PRIJAVI SE
        </h1>

        {/* Login Form Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-white text-lg font-semibold mb-3">
                AD nalog
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white placeholder-purple-200 rounded-2xl focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-lg"
                placeholder="npr. abc321"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-white text-lg font-semibold mb-3">
                Lozinka
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white placeholder-purple-200 rounded-2xl focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-lg"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-200 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 focus:ring-4 focus:ring-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Prijava...
                </div>
              ) : (
                "Prijavi se"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
