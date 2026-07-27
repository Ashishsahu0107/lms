import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getTeachers,
  createTeacher,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherAnalytics,
} from "../../../services/adminService";
import { getCourses } from "../../../services/courseService";
import TeacherList from "./TeacherList";
import TeacherDetails from "./TeacherDetails";
import CreateTeacher from "./CreateTeacher";
import EditTeacher from "./EditTeacher";
import TeacherAnalytics from "./TeacherAnalytics";
import { Loader2, AlertCircle } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";

export default function AdminTeachers() {
  const [view, setView] = useState("list"); // "list" | "details" | "create" | "edit" | "analytics"
  const [teachers, setTeachers] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherDetailData, setTeacherDetailData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal triggers
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmActionType, setConfirmActionType] = useState(null); // "suspend" | "activate" | "delete"
  const [targetTeacher, setTargetTeacher] = useState(null);

  // Bulk Import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPayload, setImportPayload] = useState("");

  const loadTeachersList = async () => {
    try {
      setLoading(true);
      const res = await getTeachers();
      if (res.data?.success) {
        setTeachers(res.data.data.teachers || []);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to sync teacher records with LMS database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachersList();

    // Preload available courses for assignments checklist
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

  const handleViewDetails = async (t) => {
    try {
      setLoading(true);
      const res = await getTeacher(t._id);
      if (res.data?.success) {
        setTeacherDetailData(res.data.data);
        setView("details");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t) => {
    setSelectedTeacher(t);
    setView("edit");
  };

  const handleNavigateToCreate = () => {
    setView("create");
  };

  const handleNavigateToAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getTeacherAnalytics();
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

  const handleTriggerConfirm = (teacher, action) => {
    setTargetTeacher(teacher);
    setConfirmActionType(action);
    setShowConfirmModal(true);
  };

  const handleExecuteConfirm = async () => {
    if (!targetTeacher || !confirmActionType) return;
    try {
      setLoading(true);
      setShowConfirmModal(false);

      if (confirmActionType === "delete") {
        await deleteTeacher(targetTeacher._id);
      } else {
        const status = confirmActionType === "suspend" ? "suspended" : "active";
        await updateTeacher(targetTeacher._id, { status });
      }

      await loadTeachersList();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTargetTeacher(null);
      setConfirmActionType(null);
    }
  };

  const handleCreateSave = async (payload) => {
    try {
      setLoading(true);
      await createTeacher(payload);
      setView("list");
      await loadTeachersList();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async (id, payload) => {
    try {
      setLoading(true);
      await updateTeacher(id, payload);
      setView("list");
      await loadTeachersList();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSelectedTeacher(null);
    }
  };

  const handleExportCSV = () => {
    // Generate browser download link directly to CSV endpoint
    window.open(
      `http://${window.location.hostname}:5000/api/admin/users/export`,
      "_blank",
    );
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
      await updateTeacher("bulk", { bulkUsers: usersArray }); // mapped to import helper in custom bulk routes

      setImportPayload("");
      await loadTeachersList();
    } catch (err) {
      alert(
        "Invalid JSON format. Please upload a correct array of user profiles.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && view === "list") {
    return (
      <div
        className="flex flex-col justify-center items-center py-32 space-y-4"
        id="admin-teachers-loading"
      >
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Syncing educator archives...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="admin-teachers-orchestrator">
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
            <TeacherList
              teachers={teachers}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onSuspend={(t) => handleTriggerConfirm(t, "suspend")}
              onActivate={(t) => handleTriggerConfirm(t, "activate")}
              onDelete={(t) => handleTriggerConfirm(t, "delete")}
              onNavigateToCreate={handleNavigateToCreate}
              onNavigateToAnalytics={handleNavigateToAnalytics}
              onBulkImport={handleBulkImportTrigger}
              onExportCSV={handleExportCSV}
            />
          )}

          {view === "details" && teacherDetailData && (
            <TeacherDetails
              data={teacherDetailData}
              onBack={() => setView("list")}
              onSendEmail={(email) =>
                (window.location.href = `mailto:${email}`)
              }
            />
          )}

          {view === "create" && (
            <CreateTeacher
              coursesList={coursesList}
              onSave={handleCreateSave}
              onCancel={() => setView("list")}
            />
          )}

          {view === "edit" && selectedTeacher && (
            <EditTeacher
              teacher={selectedTeacher}
              coursesList={coursesList}
              onSave={handleEditSave}
              onCancel={() => setView("list")}
            />
          )}

          {view === "analytics" && analyticsData && (
            <TeacherAnalytics
              analyticsData={analyticsData}
              onBack={() => setView("list")}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Confirmation Action Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="System Credentials Warning"
      >
        {targetTeacher && (
          <div className="space-y-4 text-sm" id="confirm-action-modal">
            {confirmActionType === "delete" ? (
              <div className="flex gap-3 p-4 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20">
                <AlertCircle className="h-6 w-6 shrink-0" />
                <p>
                  Permanently delete educator account{" "}
                  <strong>{targetTeacher.name}</strong>? This action terminates
                  all course reference keys and cannot be undone.
                </p>
              </div>
            ) : (
              <div className="flex gap-3 p-4 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <AlertCircle className="h-6 w-6 shrink-0" />
                <p>
                  Are you sure you want to {confirmActionType} educator account{" "}
                  <strong>{targetTeacher.name}</strong>? Suspended teachers
                  cannot host lessons or grade students.
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant={
                  confirmActionType === "delete" ? "destructive" : "default"
                }
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
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Bulk JSON Data Import"
      >
        <div className="space-y-4 text-sm" id="import-users-modal">
          <p className="text-muted-foreground">
            Paste a JSON array containing teacher/student objects mapping name
            and email fields:
          </p>
          <textarea
            className="w-full min-h-36 rounded-lg border border-border bg-card p-3 font-mono text-xs focus:outline-none"
            placeholder='[{"name": "Alice Smith", "email": "alice@lms.com", "role": "teacher"}]'
            value={importPayload}
            onChange={(e) => setImportPayload(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={handleExecuteImport}
            >
              Execute Import
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
