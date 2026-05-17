import React from "react";

export default function AuthForm() {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          className="mt-1 w-full rounded-md border border-slate-300 p-2"
          placeholder="admin@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input
          type="password"
          className="mt-1 w-full rounded-md border border-slate-300 p-2"
          placeholder="admin123"
        />
      </div>
      <button type="button" className="rounded-md bg-indigo-600 px-4 py-2 text-white">
        Login (starter)
      </button>
    </form>
  );
}

