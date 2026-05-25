import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { apiPost } from "../../services/apiClient";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiPost("/auth/register", {
        name,
        email,
        password,
        role,
      });

      if (res.data?.success) {
        const { token, user } = res.data.data;

        // Save in LocalStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Set Auth Context
        login(user);
        toast.success("Registration successful!");

        // Redirect based on selected role
        if (user.role === "super_admin") {
          navigate("/admin/dashboard");
        } else if (user.role === "teacher") {
          navigate("/teacher/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      } else {
        setError(res.data?.message || "Registration failed. Try again.");
      }
    } catch (err) {
      console.error("Register failure:", err);
      setError(err.response?.data?.message || err.message || "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 py-8">
      <div className="w-full max-w-md">
        {/* LOGO */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-wide">LMS Pro</h1>
          <p className="mt-2 text-blue-200">Create your global learning account</p>
        </div>

        {/* REGISTRATION CARD */}
        <Card className="border-muted shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-bold">Get Started</CardTitle>
            <p className="mt-1 text-center text-xs text-muted-foreground">Sign up to join our online classroom</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* ERROR DISPLAY */}
              {error && (
                <div className="rounded-xl bg-error/10 border border-error/20 p-3.5 text-xs font-semibold text-error text-center animate-shake">
                  {error}
                </div>
              )}

              {/* NAME */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground/80">Full Name</label>
                <Input
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-muted h-10 text-sm"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground/80">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-muted h-10 text-sm"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground/80">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-muted h-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* REGISTER BUTTON */}
              <Button type="submit" disabled={loading} className="w-full h-10 text-sm font-semibold mt-6">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* REDIRECT TO LOGIN */}
            <div className="mt-4 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-blue-400 hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
