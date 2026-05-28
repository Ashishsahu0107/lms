import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStudents, createStudent, getStudent, updateStudent, deleteStudent, getStudentAnalytics } from "../../../services/adminService";
import { getCourses } from "../../../services/courseService";
import StudentList from "./StudentList";
import StudentDetails from "./StudentDetails";
import CreateStudent from "./CreateStudent";
import EditStudent from "./EditStudent";
import StudentAnalytics from "./StudentAnalytics";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";

export default function AdminStudents() {
  const [view, setView] = useState("list"); // "list" | "details" | "create" | "edit" | "analytics"
  const [students, setStudents] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetailData, setStudentDetailData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal triggers
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmActionType, setConfirmActionType] = useState(null); // "suspend" | "activate" | "delete"
  const [targetStudent, setTargetStudent] = useState(null);

  // Bulk Import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPayload, setImportPayload] = useState("");

  const loadStudentsList = async () => {
    try {
      setLoading(true);
      const res = await getStudents();
      if (res.data?.success) {
        setStudents(res.data.data.students || []);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to sync student records with LMS database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentsList();

    // Preload available courses for syllabus checklists
    async function fetchCourses() {
      try {
        const res = await getCourses();
        if (res.data?.success) {
          setCoursesList(res.data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchCourses();
  }, []);

  const handleViewDetails = async (s) => {
    try {
      setLoading(true);
      const res = await getStudent(s._id);
      if (res.data?.success) {
        setStudentDetailData(res.data.data);
        setView("details");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s) => {
    setSelectedStudent(s);
    setView("edit");
  };

  const handleNavigateToCreate = () => {
    setView("create");
  };

  const handleNavigateToAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getStudentAnalytics();
      if (res.data?.success) {
        setAnalyticsData(res.data.data);
        setView("analytics");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerConfirm = (student, action) => {
    setTargetStudent(student);
    setConfirmActionType(action);
    setShowConfirmModal(true);
  };

  const handleExecuteConfirm = async () => {
    if (!targetStudent || !confirmActionType) return;
    try {
      setLoading(true);
      setShowConfirmModal(false);

      if (confirmActionType === "delete") {
        await deleteStudent(targetStudent._id);
      } else {
        const status = confirmActionType === "suspend" ? "suspended" : "active";
        await updateStudent(targetStudent._id, { status });
      }

      await loadStudentsList();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTargetStudent(null);
      setConfirmActionType(null);
    }
  };

  const handleCreateSave = async (payload) => {
    try {
      setLoading(true);
      await createStudent(payload);
      setView("list");
      await loadStudentsList();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async (id, payload) => {
    try {
      setLoading(true);
      await updateStudent(id, payload);
      setView("list");
      await loadStudentsList();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSelectedStudent(null);
    }
  };

  const handleExportCSV = () => {
    // Generate browser download link directly to CSV endpoint
    window.open(`http://${window.location.hostname}:5000/api/admin/users/export`, "_blank");
  };

  const handleBulkImportTrigger = () => {
    setShowImportModal(true);
  };

  const handleExecuteImport = async () => {
    try {
      if (!importPayload) return;
      const parsed = JSON.parse(importPayload);
      setLoading(true);
      setShowImportModal(false);

      // Perform bulk api
      const usersArray = Array.isArray(parsed) ? parsed : [parsed];
      await updateStudent("bulk", { bulkUsers: usersArray }); // mapped to import helper in custom bulk routes

      setImportPayload("");
      await loadStudentsList();
    } catch (err) {
      alert("Invalid JSON format. Please upload a correct array of user profiles.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && view === "list") {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-4" id="admin-students-loading">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Syncing student archives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="admin-students-orchestrator">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl p-4 flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* View Container Switcher */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          {view === "list" && (
            <StudentList
              students={students}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onSuspend={(s) => handleTriggerConfirm(s, "suspend")}
              onActivate={(s) => handleTriggerConfirm(s, "activate")}
              onDelete={(s) => handleTriggerConfirm(s, "delete")}
              onNavigateToCreate={handleNavigateToCreate}
              onNavigateToAnalytics={handleNavigateToAnalytics}
              onBulkImport={handleBulkImportTrigger}
              onExportCSV={handleExportCSV}
            />
          )}

          {view === "details" && studentDetailData && (
            <StudentDetails
              data={studentDetailData}
              onBack={() => setView("list")}
              onSendEmail={(email) => window.location.href = `mailto:${email}`}
            />
          )}

          {view === "create" && (
            <CreateStudent
              coursesList={coursesList}
              onSave={handleCreateSave}
              onCancel={() => setView("list")}
            />
          )}

          {view === "edit" && selectedStudent && (
            <EditStudent
              student={selectedStudent}
              coursesList={coursesList}
              onSave={handleEditSave}
              onCancel={() => setView("list")}
            />
          )}

          {view === "analytics" && analyticsData && (
            <StudentAnalytics
              analyticsData={analyticsData}
              onBack={() => setView("list")}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Confirmation Action Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="System Credentials Warning">
        {targetStudent && (
          <div className="space-y-4 text-sm" id="confirm-action-modal">
            {confirmActionType === "delete" ? (
              <div className="flex gap-3 p-4 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20">
                <AlertCircle className="h-6 w-6 shrink-0" />
                <p>
                  Permanently delete student account <strong>{targetStudent.name}</strong>? This action terminates all enrollments references keys and cannot be undone.
                </p>
              </div>
            ) : (
              <div className="flex gap-3 p-4 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <AlertCircle className="h-6 w-6 shrink-0" />
                <p>
                  Are you sure you want to {confirmActionType} student account <strong>{targetStudent.name}</strong>? Suspended students cannot log in or study course syllabus.
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
              <Button
                variant={confirmActionType === "delete" ? "destructive" : "default"}
                onClick={handleExecuteConfirm}
                className="font-semibold shadow"
              >
                Confirm {confirmActionType}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk JSON Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Bulk JSON Data Import">
        <div className="space-y-4 text-sm" id="import-users-modal">
          <p className="text-muted-foreground">Paste a JSON array containing teacher/student objects mapping name and email fields:</p>
          <textarea
            className="w-full min-h-36 rounded-lg border border-border bg-card p-3 font-mono text-xs focus:outline-none"
            placeholder='[{"name": "Alice Smith", "email": "alice@lms.com", "role": "student"}]'
            value={importPayload}
            onChange={(e) => setImportPayload(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowImportModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={handleExecuteImport}>
              Execute Import
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}