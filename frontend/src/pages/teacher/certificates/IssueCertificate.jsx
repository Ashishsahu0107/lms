import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Send, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { getTeacherCourses } from "../../../services/teacherService";
import {
  issueCertificate,
  getCourseStudents,
} from "../../../services/certificateService";
import toast from "react-hot-toast";

export default function IssueCertificate() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [courseId, setCourseId] = useState("");
  const [studentId, setStudentId] = useState("");

  // Load teacher's courses
  useEffect(() => {
    async function loadCourses() {
      try {
        setLoadingCourses(true);
        const res = await getTeacherCourses();
        setCourses(res.data?.data || res.data?.courses || res.data || []);
      } catch (err) {
        toast.error("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    }
    loadCourses();
  }, []);

  // Load enrolled students with progress when course is selected
  useEffect(() => {
    async function loadStudents() {
      if (!courseId) {
        setStudents([]);
        return;
      }

      try {
        setLoadingStudents(true);
        const res = await getCourseStudents(courseId);
        // Safely extract students list
        const rawStudents = Array.isArray(res.data)
          ? res.data
          : res.data?.data || res.data?.students || [];
        setStudents(rawStudents);
      } catch (err) {
        toast.error("Failed to load enrolled students details");
      } finally {
        setLoadingStudents(false);
      }
    }
    loadStudents();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId || !studentId) {
      toast.error("Please select a course and a student");
      return;
    }

    try {
      setSubmitting(true);
      const res = await issueCertificate({ courseId, studentId });
      if (res.data?.success) {
        toast.success("Certificate issued successfully!");
        navigate("/teacher/certificates");
      }
    } catch (err) {
      // The interceptor displays errors automatically
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="space-y-6 max-w-2xl mx-auto"
      id="teacher-issue-certificate-page"
    >
      <div className="flex items-center gap-3">
        <Link
          to="/teacher/certificates"
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Issue Certificate
          </h1>
          <p className="text-xs text-muted-foreground">
            Verify course requirements and grant completion credentials
          </p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          {loadingCourses ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
              <p className="text-xs text-muted-foreground">
                Loading your courses list…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Select Course */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Select Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    setStudentId("");
                  }}
                  className="w-full h-11 px-3 rounded-lg border border-border bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Student */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Select Enrolled Student
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={!courseId || loadingStudents}
                  className="w-full h-11 px-3 rounded-lg border border-border bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 disabled:bg-muted"
                  required
                >
                  <option value="">
                    {loadingStudents
                      ? "Loading students list…"
                      : !courseId
                        ? "Select course first"
                        : "-- Choose Student --"}
                  </option>
                  {students.map((s) => {
                    const progressVal = s.progress ?? 0;
                    return (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.email}) — {progressVal}% Progress
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Notice */}
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20 flex items-start gap-2 text-xs leading-normal">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    Course-Completion Policy Requirement
                  </p>
                  <p className="text-[11px] mt-0.5">
                    Certificates can only be successfully saved in the registry
                    if the selected student has met the minimum 90% syllabus
                    progress milestone.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Link to="/teacher/certificates" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 font-semibold"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={submitting || !studentId}
                  className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Issuing…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Grant Certificate
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
