import { useState, useEffect } from "react";
import { ChevronLeft, Save, Edit, Check } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function EditStudent({
  student = {},
  coursesList = [],
  onSave,
  onCancel,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [status, setStatus] = useState("active");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setName(student.name || "");
      setEmail(student.email || "");
      setPhone(student.phone || "");
      setBio(student.bio || "");
      setAvatar(student.avatar || "");
      setStatus(student.status || "active");
      setEnrolledCourses(student.enrolledCourses || []);
    }
  }, [student]);

  const handleToggleCourse = (cId) => {
    if (enrolledCourses.includes(cId)) {
      setEnrolledCourses(enrolledCourses.filter((id) => id !== cId));
    } else {
      setEnrolledCourses([...enrolledCourses, cId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      setIsSubmitting(true);
      await onSave(student._id, {
        name,
        email,
        phone,
        bio,
        avatar,
        status,
        enrolledCourses,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="edit-student-root">
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={onCancel}
        >
          <ChevronLeft className="h-4 w-4" /> Cancel Edits
        </Button>
      </div>

      <Card className="hover:shadow-md transition-all max-w-4xl mx-auto">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" /> Edit Student Credentials
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Full Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Sarah Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email Address *
                </label>
                <Input
                  required
                  type="email"
                  placeholder="e.g. sarah.johnson@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Phone Contact
                </label>
                <Input
                  placeholder="e.g. +1 (555) 987-6543"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Account status
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none h-10"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Profile Avatar Url */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Profile Photo Url
              </label>
              <Input
                placeholder="e.g. https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
            </div>

            {/* Biography */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Short Bio / Notes
              </label>
              <textarea
                className="w-full min-h-24 rounded-lg border border-border bg-card p-3 text-sm focus:outline-none"
                placeholder="Write student biographical descriptions..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Course Checklist Assignments */}
            <div className="space-y-3 pt-4 border-t">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Modify Enrolled Courses
              </label>
              {coursesList.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No active courses registered inside system database to assign.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {coursesList.map((course) => {
                    const isSelected = enrolledCourses.includes(course._id);
                    return (
                      <div
                        key={course._id}
                        className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                            : "bg-card border-border hover:bg-muted/50"
                        }`}
                        onClick={() => handleToggleCourse(course._id)}
                      >
                        <div
                          className={`h-4 w-4 border rounded flex items-center justify-center ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-muted"
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 stroke-[3]" />
                          )}
                        </div>
                        <span className="text-xs truncate">{course.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
              >
                <Save className="h-4 w-4" />{" "}
                {isSubmitting ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
