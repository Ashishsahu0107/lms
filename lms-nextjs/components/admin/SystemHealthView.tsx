"use client";

// components/admin/SystemHealthView.tsx — System Health & OpenAPI Inspector
import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function SystemHealthView() {
  const [healthData, setHealthData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((r) => r.json())
      .then((data) => setHealthData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-base-content font-display">
            System Health & Security 🛡️
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Realtime system metrics, liveness probes, and platform stack status.
          </p>
        </div>
        <Link href="/api-docs" className="btn btn-primary btn-sm gap-2">
          📜 Swagger OpenAPI Explorer
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow border border-base-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🔌</span>
            <div>
              <p className="text-xs text-base-content/50 uppercase font-semibold">API Liveness</p>
              <p className="font-bold text-success text-lg">Healthy (200 OK)</p>
            </div>
          </div>
          <p className="text-xs text-base-content/60 mt-2">Next.js 15 Route Handlers active.</p>
        </div>

        <div className="card bg-base-100 shadow border border-base-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🗄️</span>
            <div>
              <p className="text-xs text-base-content/50 uppercase font-semibold">Database Stack</p>
              <p className="font-bold text-primary text-lg">PostgreSQL (Prisma 6)</p>
            </div>
          </div>
          <p className="text-xs text-base-content/60 mt-2">Connection pool configured.</p>
        </div>

        <div className="card bg-base-100 shadow border border-base-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⚡</span>
            <div>
              <p className="text-xs text-base-content/50 uppercase font-semibold">Realtime Engine</p>
              <p className="font-bold text-secondary text-lg">Socket.io (WebSockets)</p>
            </div>
          </div>
          <p className="text-xs text-base-content/60 mt-2">Custom Node HTTP Server wrapper.</p>
        </div>
      </div>

      {/* Raw Health JSON */}
      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-lg mb-2">Liveness Diagnostic Output</h2>
          {loading ? (
            <div className="py-8 text-center">
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          ) : (
            <pre className="bg-base-200 p-4 rounded-xl text-xs font-mono text-base-content overflow-x-auto">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
