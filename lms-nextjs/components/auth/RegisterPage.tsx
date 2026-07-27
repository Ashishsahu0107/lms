"use client";

// components/auth/RegisterPage.tsx — Ultra-Sleek Modern Registration Card
import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      login(data.data.token, data.data.user);
      toast.success(`Account created! Welcome, ${data.data.user.name}`);
      router.push("/student/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }, [form, API_URL, login, router]);

  return (
    <div className="w-full max-w-md mx-auto space-y-5 animate-fade-in text-base-content">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          required
          placeholder="Jane Doe"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="jane@lmspro.edu"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <Input
          label="Password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <Input
          label="Confirm Password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full shadow-lg shadow-primary/25 mt-2"
        >
          Create Student Account
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center pt-1">
        <div className="w-full border-t border-base-300" />
        <span className="absolute bg-base-100 px-3 text-xs text-base-content/50">
          Already have an account?
        </span>
      </div>

      <Link href="/login" className="block">
        <Button variant="outline" className="w-full">
          Sign In Instead
        </Button>
      </Link>
    </div>
  );
}
