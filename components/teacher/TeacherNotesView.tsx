"use client";

// components/teacher/TeacherNotesView.tsx — Course Notes Component
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function TeacherNotesView() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    toast.success("Note saved successfully!");
    setTitle("");
    setContent("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-base-content font-display">
          Course Notes & Study Materials 📌
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          Publish supplementary study notes and reading materials for your
          courses.
        </p>
      </div>

      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body p-6">
          <h2 className="card-title text-lg mb-4">Publish Study Note</h2>
          <form onSubmit={handleSaveNote} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-xs">
                  Note Title
                </span>
              </label>
              <input
                type="text"
                required
                className="input input-bordered focus:input-primary text-sm"
                placeholder="Module 1: Reference Cheatsheet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-xs">
                  Note Content (Markdown / HTML)
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-36 focus:textarea-primary text-sm"
                placeholder="Write study notes or key points..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-sm">
              📌 Publish Note
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
