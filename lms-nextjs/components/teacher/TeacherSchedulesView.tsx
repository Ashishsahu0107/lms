"use client";

// components/teacher/TeacherSchedulesView.tsx — Class Schedules Component
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function TeacherSchedulesView() {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate) return;
    toast.success("Live Class Scheduled!");
    setTitle("");
    setStartDate("");
    setMeetingUrl("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-base-content font-display">
          Live Class Schedules 🗓️
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          Schedule live interactive Zoom or Google Meet classes for enrolled students.
        </p>
      </div>

      <div className="card bg-base-100 shadow border border-base-200 p-6">
        <h2 className="card-title text-lg mb-4">Schedule Live Session</h2>
        <form onSubmit={handleSchedule} className="space-y-4 max-w-lg">
          <div className="form-control">
            <label className="label"><span className="label-text font-medium text-xs">Class Topic</span></label>
            <input
              type="text"
              required
              className="input input-bordered focus:input-primary text-sm"
              placeholder="Live Q&A: Next.js Performance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-medium text-xs">Session Date & Time</span></label>
            <input
              type="datetime-local"
              required
              className="input input-bordered focus:input-primary text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-medium text-xs">Zoom / Google Meet Link</span></label>
            <input
              type="url"
              className="input input-bordered focus:input-primary text-sm"
              placeholder="https://meet.google.com/xyz-abc-def"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            🗓️ Schedule Class
          </button>
        </form>
      </div>
    </div>
  );
}
