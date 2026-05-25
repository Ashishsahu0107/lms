import React, { useState, useEffect } from "react";
import { ChevronLeft, Save, Edit, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function EditTeacher({
  teacher = {},
  coursesList = [],
  onSave,
  onCancel,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [qualification, setQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [status, setStatus] = useState("active");
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (teacher) {
      setName(teacher.name || "");
      setEmail(teacher.email || "");
      setPhone(teacher.phone || "");
      setBio(teacher.bio || "");
      setAvatar(teacher.avatar || "");
      setQualification(teacher.qualification || "");
      setSpecialization(teacher.specialization || "");
      setExperience(teacher.experience || "");
      setStatus(teacher.status || "active");
      setAssignedCourses(teacher.assignedCourses || teacher.teachingCourses || []);
    }
  }, [teacher]);

  const handleToggleCourse = (cId) => {
    if (assignedCourses.includes(cId)) {
      setAssignedCourses(assignedCourses.filter(id => id !== cId));
    } else {
      setAssignedCourses([...assignedCourses, cId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      setIsSubmitting(true);
      await onSave(teacher._id, {
        name,
        email,
        phone,
        bio,
        avatar,
        qualification,
        specialization,
        experience: Number(experience) || 0,
        status,
        assignedCourses,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="edit-teacher-root">
      <div className="flex items-center">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onCancel}>
          <ChevronLeft className="h-4 w-4" /> Cancel Edits
        </Button>
      </div>

      <Card className="hover:shadow-md transition-all max-w-4xl mx-auto">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" /> Edit Teacher Credentials Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Dr. James Wilson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address *</label>
                <Input
                  required
                  type="email"
                  placeholder="e.g. james.wilson@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Contact</label>
                <Input
                  placeholder="e.g. +1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account status</label>
                <select
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none h-10"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>
            </div>

            {/* Profile Avatar Url */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profile Photo Url</label>
              <Input
                placeholder="e.g. https://images.unsplash.com/photo-1544005313-94ddf0286df2"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
            </div>

            {/* Qualifications */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Degree / Qualification</label>
                <Input
                  placeholder="e.g. Ph.D. Computer Science"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Specialization Topic</label>
                <Input
                  placeholder="e.g. Full-Stack Dev / React"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Experience (Years)</label>
                <Input
                  type="number"
                  placeholder="e.g. 8"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Short Biography</label>
              <textarea
                className="w-full min-h-24 rounded-lg border border-border bg-card p-3 text-sm focus:outline-none"
                placeholder="Describe educator professional backgrounds..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Course Checklist Assignments */}
            <div className="space-y-3 pt-4 border-t">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Assign Platform Courses</label>
              {coursesList.length === 0 ? (
                <p className="text-xs text-muted-foreground">No active courses registered inside system database to assign.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {coursesList.map((course) => {
                    const isSelected = assignedCourses.includes(course._id);
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
                        <div className={`h-4 w-4 border rounded flex items-center justify-center ${
                          isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-muted"
                        }`}>
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
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
              <Button type="submit" disabled={isSubmitting} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md">
                <Save className="h-4 w-4" /> {isSubmitting ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
