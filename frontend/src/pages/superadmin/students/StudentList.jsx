import { useState } from "react";
import {
  Search,
  Eye,
  Edit,
  Ban,
  CheckCircle2,
  Trash2,
  UserPlus,
  FileSpreadsheet,
  BookOpen,
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Avatar } from "../../../components/ui/Avatar";
import { ProgressBar } from "../../../components/ui/ProgressBar";

export default function StudentList({
  students = [],
  onViewDetails,
  onEdit,
  onSuspend,
  onActivate,
  onDelete,
  onNavigateToCreate,
  onNavigateToAnalytics,
  onBulkImport,
  onExportCSV,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filters logic
  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === "active")
      return matchesSearch && s.status === "active";
    if (statusFilter === "suspended")
      return matchesSearch && s.status === "suspended";
    return matchesSearch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="space-y-6" id="student-list-root">
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search students by name or email address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
          <select
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onExportCSV}
          >
            <FileSpreadsheet className="h-4 w-4" /> Export CSV
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onNavigateToCreate}
          >
            <UserPlus className="h-4 w-4" /> Create Student
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2">
        {["all", "active", "suspended"].map((tab) => {
          const count = students.filter((s) => {
            if (tab === "all") return true;
            return s.status === tab;
          }).length;
          return (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 transition-all ${
                statusFilter === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setStatusFilter(tab);
                setCurrentPage(1);
              }}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Student List Table */}
      <Card className="overflow-hidden hover:shadow-md transition-all">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-semibold text-foreground">No students found</p>
            <p className="text-sm">
              No student profiles match your search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Enrolled Courses</th>
                  <th className="py-3.5 px-4">Completed Paths</th>
                  <th className="py-3.5 px-4">Average Progress</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((student) => (
                  <tr
                    key={student._id}
                    className="border-b hover:bg-muted/10 transition-colors text-sm"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          className="w-10 h-10"
                          src={student.avatar}
                          fallback={student.name.charAt(0)}
                        />
                        <div>
                          <p className="font-bold text-foreground">
                            {student.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{student.enrolledCoursesCount || 0} classes</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>
                          {student.completedCoursesCount || 0} courses
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-28 space-y-1">
                        <ProgressBar
                          value={student.averageProgress || 0}
                          size="xs"
                        />
                        <span className="text-[10px] font-bold text-muted-foreground mt-1 block">
                          {student.averageProgress || 0}% Complete
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          student.status === "active"
                            ? "success"
                            : "destructive"
                        }
                        className="capitalize font-semibold border-0 text-xs"
                      >
                        {student.status || "active"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          onClick={() => onViewDetails(student)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:bg-amber-50"
                          onClick={() => onEdit(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {student.status === "active" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                            onClick={() => onSuspend(student)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => onActivate(student)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(student)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginate control */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3.5 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filtered.length)} of {filtered.length}{" "}
              students
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="p-2 h-8 w-8"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <Button
                  key={idx}
                  variant={currentPage === idx + 1 ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 text-xs font-semibold"
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="p-2 h-8 w-8"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Bulk actions and analytics footer triggers */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20 border border-dashed rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500 fill-current" />
          <div>
            <p className="font-semibold text-sm">
              Need student study telemetry insights?
            </p>
            <p className="text-xs text-muted-foreground">
              Review learning curves, average quiz accuracies, and attendance
              rate metrics.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onNavigateToAnalytics}
          >
            <TrendingUp className="h-4 w-4" /> View Analytics Graph
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onBulkImport}
          >
            <UserPlus className="h-4 w-4" /> Bulk Import JSON
          </Button>
        </div>
      </div>
    </div>
  );
}
