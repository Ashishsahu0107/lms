"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { Course, Module, Topic, TopicResource } from "@prisma/client";

// Extended types to include relations
type TopicWithResources = Topic & { resources: TopicResource[] };
type ModuleWithTopics = Module & { topics: TopicWithResources[] };
type CourseWithModules = Course & { modules: ModuleWithTopics[] };

export default function CourseEditorView({ course }: { course: CourseWithModules }) {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(
    course.modules[0]?.id || null
  );
  const [activeTopic, setActiveTopic] = useState<TopicWithResources | null>(
    course.modules[0]?.topics[0] || null
  );
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [course.modules[0]?.id || ""]: true,
  });

  const [activeContentType, setActiveContentType] = useState("Rich Text");

  // Toggle module accordion
  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  return (
    <div className="flex h-screen w-full bg-[#FAFBFF] overflow-hidden">
      {/* 1. GLOBAL SIDEBAR (From layout, but we simulate the nav area shown in image for full fidelity) */}
      {/* Wait, the existing dashboard layout provides the global sidebar. 
          But the image shows a specific layout. If we use the existing layout, it wraps this page.
          Let's assume the outer layout provides the main sidebar (Dashboard, My Courses, etc.). 
          We will build the page content starting from the Breadcrumbs. 
          Actually, the image shows a white sidebar on the far left. Our current layout likely has one. 
          We'll focus on the area *right* of the main global sidebar. */}

      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* ══ TOP HEADER ══ */}
        <header className="h-[72px] px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
            <Link href="/teacher/dashboard" className="hover:text-indigo-600 transition-colors">
              Dashboard
            </Link>
            <span className="text-slate-300">›</span>
            <Link href="/teacher/courses" className="hover:text-indigo-600 transition-colors">
              My Courses
            </Link>
            <span className="text-slate-300">›</span>
            <span className="text-slate-800">{course.title}</span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-800">
              {course.modules.find((m) => m.id === activeModuleId)?.title || "Module"}
            </span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-800 font-semibold">Edit Content</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Preview
            </button>
            <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save as Draft
            </button>
            <button className="px-5 py-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Publish
              <span className="border-l border-white/20 pl-2 ml-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
          </div>
        </header>

        {/* ══ PAGE CONTENT ══ */}
        <div className="flex flex-1 min-h-0">
          
          {/* 2. INNER LEFT SIDEBAR (Modules & Lessons) */}
          <aside className="w-[320px] bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
            <div className="p-6 pb-2 border-b border-slate-100 flex-1 overflow-y-auto">
              
              {/* Modules List */}
              <div className="space-y-4">
                {course.modules.map((mod, modIdx) => {
                  const isOpen = expandedModules[mod.id];
                  return (
                    <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {/* Module Header */}
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {modIdx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-slate-800 pr-4">{mod.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {mod.topics.length} Lessons • 2h 15m
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-slate-400 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>

                      {/* Topics List */}
                      {isOpen && (
                        <div className="px-2 pb-2">
                          {mod.topics.map((topic, topicIdx) => {
                            const isActive = activeTopic?.id === topic.id;
                            return (
                              <div key={topic.id} className="mb-1">
                                <button
                                  onClick={() => {
                                    setActiveTopic(topic);
                                    setActiveModuleId(mod.id);
                                  }}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                                    isActive
                                      ? "bg-indigo-50 border border-indigo-200 shadow-sm"
                                      : "hover:bg-slate-50 border border-transparent"
                                  }`}
                                >
                                  <div className="flex items-center justify-center w-5 h-5 shrink-0 text-slate-300">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <line x1="8" y1="6" x2="21" y2="6"></line>
                                      <line x1="8" y1="12" x2="21" y2="12"></line>
                                      <line x1="8" y1="18" x2="21" y2="18"></line>
                                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`text-[13px] font-semibold truncate ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
                                      {modIdx + 1}.{topicIdx + 1} {topic.title}
                                    </h4>
                                    <p className={`text-[11px] ${isActive ? 'text-indigo-600/70' : 'text-slate-400'}`}>
                                      {topic.duration} min
                                    </p>
                                  </div>
                                  {isActive ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600 shrink-0">
                                      <circle cx="12" cy="12" r="1"></circle>
                                      <circle cx="12" cy="5" r="1"></circle>
                                      <circle cx="12" cy="19" r="1"></circle>
                                    </svg>
                                  ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500 shrink-0">
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                  )}
                                </button>
                                
                                {/* Expanded active topic sub-menu */}
                                {isActive && (
                                  <div className="ml-9 mr-3 mt-1 mb-3 space-y-1">
                                    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] font-medium text-indigo-600 hover:bg-indigo-50/50 rounded">
                                      <span className="w-1 h-1 rounded-full bg-indigo-600"></span> Content
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-50 rounded">
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span> Resources ({topic.resources?.length || 0})
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-50 rounded">
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span> Quiz (0 Questions)
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
              <button className="w-full py-2.5 rounded-lg border border-indigo-200 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 bg-white shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Lesson
              </button>
              <button className="w-full py-2.5 rounded-lg border border-slate-200 border-dashed text-slate-500 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 bg-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Section
              </button>
            </div>
          </aside>

          {/* 3. MAIN CONTENT EDITOR */}
          <main className="flex-1 h-full overflow-y-auto bg-[#FAFBFF]">
            <div className="max-w-4xl mx-auto p-8 h-full flex flex-col">
              
              <div className="flex gap-6 mb-8">
                {/* Title Input */}
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-600 mb-2">Lesson Title</label>
                  <input
                    type="text"
                    value={activeTopic?.title || ""}
                    readOnly
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
                  />
                </div>
                {/* Duration Input */}
                <div className="w-40">
                  <label className="block text-xs font-bold text-slate-600 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={activeTopic?.duration || ""}
                    readOnly
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-slate-800 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              {/* Content Type Selector */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 mb-2">Content Type</label>
                <div className="flex gap-2">
                  {["Rich Text", "Markdown", "Video", "PDF", "HTML", "Embed"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveContentType(type)}
                      className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                        activeContentType === type
                          ? "bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm"
                          : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor Container */}
              <div className="bg-white border border-slate-200 rounded-2xl flex flex-col flex-1 min-h-[400px] shadow-sm overflow-hidden mb-8">
                {/* Editor Toolbar */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center flex-wrap gap-x-6 gap-y-2 bg-slate-50/50">
                  {/* Paragraph Select */}
                  <button className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-100 px-2 py-1 rounded">
                    Paragraph
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>

                  {/* Formatting Group */}
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold font-serif">B</button>
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 italic font-serif">I</button>
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 underline font-serif">U</button>
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100">
                      <span className="font-bold mr-1">A</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </button>
                  </div>

                  {/* Lists Group */}
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    </button>
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    </button>
                  </div>

                  {/* Insert Group */}
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </button>
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </button>
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 font-serif font-bold">
                      {"{ }"}
                    </button>
                  </div>

                  {/* Undo/Redo */}
                  <div className="flex items-center gap-1 ml-auto">
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
                    </button>
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg>
                    </button>
                  </div>
                </div>

                {/* Editor Area */}
                <div className="p-6 flex-1 bg-white">
                  <textarea
                    className="w-full h-full resize-none text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-300 focus:outline-none"
                    placeholder="Start writing lesson content here..."
                    value={activeTopic?.content || ""}
                    readOnly
                  />
                </div>

                {/* Editor Status Bar */}
                <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-[11px] font-medium text-slate-400">
                  <div>Words: {activeTopic?.content?.split(/\s+/).length || 0} &nbsp;&nbsp; Characters: {activeTopic?.content?.length || 0}</div>
                  <div className="flex items-center gap-1.5">
                    Draft saved a few seconds ago
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
              </div>

              {/* Lesson Resources Bottom Area */}
              <div>
                <h3 className="text-[15px] font-bold text-slate-800 mb-1">Lesson Resources</h3>
                <p className="text-xs text-slate-500 mb-4">Add supplementary materials for this lesson</p>
                
                <div className="flex gap-4">
                  {/* Sample Resource 1 */}
                  <div className="w-[300px] border border-slate-200 rounded-xl p-3 flex items-center gap-3 bg-white shadow-sm">
                    <div className="w-10 h-10 rounded bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM14 11h1V8.5h-1V11z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-slate-800 truncate">HTML_Quick_Reference.pdf</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">2.4 MB • PDF</p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-700">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                  </div>

                  {/* Sample Resource 2 */}
                  <div className="w-[300px] border border-slate-200 rounded-xl p-3 flex items-center gap-3 bg-white shadow-sm">
                    <div className="w-10 h-10 rounded bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-slate-800 truncate">HTML_Examples.zip</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">1.8 MB • ZIP</p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-700">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                  </div>

                  {/* Add Resource Button */}
                  <button className="w-[200px] border border-slate-200 border-dashed rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 bg-white transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Resource
                  </button>
                </div>
              </div>
              <div className="h-16"></div> {/* Bottom padding */}
            </div>
          </main>

          {/* 4. RIGHT SIDEBAR (Insert Panel) */}
          <aside className="w-[300px] bg-white border-l border-slate-200 h-full overflow-y-auto shrink-0 p-6">
            
            {/* Insert / Media Section */}
            <div className="mb-6">
              <button className="flex items-center justify-between w-full mb-4 group">
                <h3 className="text-[13px] font-bold text-slate-800">Insert</h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-slate-600 transition-colors">
                  <path d="M18 15l-6-6-6 6"/>
                </svg>
              </button>
              
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Media</h4>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button className="h-[46px] rounded-lg border border-slate-200 flex items-center justify-center gap-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  Image
                </button>
                <button className="h-[46px] rounded-lg border border-slate-200 flex items-center justify-center gap-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  Video
                </button>
                <button className="h-[46px] rounded-lg border border-slate-200 flex items-center justify-center gap-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
                  Audio
                </button>
                <button className="h-[46px] rounded-lg border border-slate-200 flex items-center justify-center gap-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                  File
                </button>
              </div>

              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Elements</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Heading", icon: <span className="font-serif font-bold text-sm">H</span> },
                  { label: "Divider", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg> },
                  { label: "Table", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> },
                  { label: "Code Block", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> },
                  { label: "Quote", icon: <span className="font-serif font-bold text-lg leading-none h-4">"</span> },
                  { label: "Alert", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> },
                  { label: "List", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> },
                  { label: "Checklist", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> },
                ].map((el, i) => (
                  <button key={i} className="h-[46px] rounded-lg border border-slate-200 flex items-center justify-start px-3 gap-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                    <span className="w-5 h-5 flex items-center justify-center text-slate-400">{el.icon}</span>
                    {el.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Accordion */}
            <div className="border-t border-slate-100 py-5">
              <button className="flex items-center justify-between w-full group">
                <h3 className="text-[13px] font-bold text-slate-800">Templates</h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-slate-600 transition-colors">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
            </div>

            {/* AI Assistant Accordion */}
            <div className="border-t border-slate-100 py-5">
              <button className="flex items-center justify-between w-full group">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-bold text-slate-800">AI Assistant</h3>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold">New</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-slate-600 transition-colors">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}
