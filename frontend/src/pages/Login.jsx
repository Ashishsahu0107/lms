import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (!form.email || !form.password) {
      setError("Fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Use AuthContext's login function
      const result = await authLogin(form.email, form.password);

      console.log("Login result:", result);

      // ✅ FIXED ROLE ROUTE
      if (result.data.role === "teacher") {
        console.log("Navigating to teacher dashboard");
        navigate("/teacher/dashboard");
      } else if (result.data.role === "superAdmin") {
        console.log("Navigating to superadmin dashboard");
        navigate("/superadmin/dashboard");
      } else {
        console.log("Navigating to student dashboard");
        navigate("/dashboard");
      }

    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Login failed";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        {/* 🔥 Title */}
        <h2 className="text-3xl font-bold text-center mb-6">
          Welcome Back 👍
        </h2>

        {/* 🔹 Email */}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* 🔹 Password */}
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {/* 🔥 Button */}
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* 🔹 Register */}
        <p className="text-center mt-4 text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold">
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}