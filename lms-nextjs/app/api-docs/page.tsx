"use client";
// app/api-docs/page.tsx — Interactive Swagger UI page
import { useEffect, useRef } from "react";

export default function ApiDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSwagger = async () => {
      // Dynamically import swagger-ui-dist to avoid SSR issues
      // @ts-expect-error swagger-ui-dist has no default type declaration
      const SwaggerUI = (await import("swagger-ui-dist/swagger-ui-bundle")).default;
      // @ts-expect-error swagger-ui-dist standalone preset
      const SwaggerUIStandalonePreset = (await import("swagger-ui-dist/swagger-ui-standalone-preset")).default;
      // @ts-expect-error swagger-ui-dist css import
      const SwaggerUICSS = await import("swagger-ui-dist/swagger-ui.css");
      void SwaggerUICSS;

      if (containerRef.current) {
        SwaggerUI({
          domNode: containerRef.current,
          url: "/api/docs",
          deepLinking: true,
          presets: [
            SwaggerUI.presets.apis,
            SwaggerUIStandalonePreset,
          ],
          plugins: [SwaggerUI.plugins.DownloadUrl],
          layout: "StandaloneLayout",
          tryItOutEnabled: true,
          requestSnippetsEnabled: true,
          defaultModelsExpandDepth: 2,
          defaultModelExpandDepth: 2,
          displayRequestDuration: true,
          filter: true,
          syntaxHighlight: {
            activated: true,
            theme: "agate",
          },
        });
      }
    };

    loadSwagger();
  }, []);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-content py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            🎓 LMS Pro API Documentation
          </h1>
          <p className="opacity-80">
            Interactive REST API explorer — Next.js 15 + PostgreSQL + Socket.io
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="badge badge-outline badge-lg text-primary-content border-primary-content/30">
              OpenAPI 3.0
            </span>
            <span className="badge badge-outline badge-lg text-primary-content border-primary-content/30">
              JWT Auth
            </span>
            <span className="badge badge-outline badge-lg text-primary-content border-primary-content/30">
              30+ Endpoints
            </span>
            <span className="badge badge-outline badge-lg text-primary-content border-primary-content/30">
              PostgreSQL
            </span>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-base-200 border-b border-base-300 py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-base-content/70">
            <strong>Quick Start:</strong> Login at{" "}
            <code className="badge badge-neutral">/api/auth/login</code> with{" "}
            <code className="badge badge-neutral">admin@lmspro.edu</code> /{" "}
            <code className="badge badge-neutral">admin123</code>, copy the
            token, then click <strong>Authorize 🔒</strong> at the top right.
          </p>
        </div>
      </div>

      {/* Swagger UI container */}
      <div ref={containerRef} id="swagger-ui" />

      {/* Swagger UI styles */}
      <style>{`
        #swagger-ui .swagger-ui .topbar { display: none; }
        #swagger-ui .swagger-ui .info { padding: 20px 0; }
        #swagger-ui .swagger-ui .scheme-container { padding: 10px 0; }
        #swagger-ui .swagger-ui .opblock-tag { font-size: 18px; }
        #swagger-ui .swagger-ui select { background: white; }
        #swagger-ui .swagger-ui .btn { border-radius: 6px; }
      `}</style>
    </div>
  );
}
