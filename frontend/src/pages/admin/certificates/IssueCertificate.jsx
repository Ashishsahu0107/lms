import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Send, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { getStudents, getCourses } from "../../../services/adminService";
import { issueCertificate } from "../../../services/certificateService";
import toast from "react-hot-toast";

export default function IssueCertificate() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [templateStyle, setTemplateStyle] = useState("Premium");

  useEffect(() => {
    async function loadFormOptions() {
      try {
        setLoading(true);
        const [studRes, courRes] = await Promise.all([
          getStudents(),
          getCourses(),
        ]);

        // Handle varying response envelopes safely
        const rawStudents = Array.isArray(studRes.data)
          ? studRes.data
          : studRes.data?.data?.students ||
            studRes.data?.students ||
            (Array.isArray(studRes.data?.data) ? studRes.data.data : null) ||
            [];
        setStudents(rawStudents);

        const rawCourses = Array.isArray(courRes.data)
          ? courRes.data
          : courRes.data?.data?.courses ||
            courRes.data?.courses ||
            (Array.isArray(courRes.data?.data) ? courRes.data.data : null) ||
            [];
        setCourses(rawCourses);
      } catch (err) {
        toast.error("Failed to load list details");
      } finally {
        setLoading(false);
      }
    }
    loadFormOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !courseId) {
      toast.error("Please select a student and a course");
      return;
    }

    try {
      setSubmitting(true);
      const res = await issueCertificate({
        studentId,
        courseId,
        templateStyle,
      });
      if (res.data?.success) {
        toast.success("Certificate issued successfully!");
        navigate("/admin/certificates/history");
      }
    } catch (err) {
      // The interceptor displays the detailed error automatically
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="space-y-6 max-w-2xl mx-auto"
      id="admin-issue-certificate-page"
    >
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/certificates"
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Issue Certificate
          </h1>
          <p className="text-xs text-muted-foreground">
            Grant validated credentials to deserving students
          </p>
        </div>
      </div>

      <Card className="border-border shadow-md">
        <CardContent className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
              <p className="text-xs text-muted-foreground">
                Loading students and courses list…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Select Student */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Select Enrolled Student
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-border bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Course */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Select Completed Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
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

              {/* Select Template Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Choose Design Template
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Classic", "Modern", "Premium"].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setTemplateStyle(style)}
                      className={`py-3 px-4 rounded-xl border-2 text-center text-xs font-extrabold transition-all ${
                        templateStyle === style
                          ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm"
                          : "border-border bg-base-100 text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20 flex items-start gap-2 text-xs leading-normal">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    Validation Verification Enforcement
                  </p>
                  <p className="text-[11px] mt-0.5">
                    The platform requires that a student completes at least 90%
                    of the syllabus milestones to be eligible for dynamic
                    certificate generation.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Link to="/admin/certificates" className="flex-1">
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
                  disabled={submitting}
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
