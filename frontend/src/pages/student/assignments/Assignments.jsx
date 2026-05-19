import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  Calendar,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { SearchBar } from "../../components/ui/SearchBar";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Modal } from "../../components/ui/Modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/Tabs";

const assignments = [
  {
    id: 1,
    title: "Mathematics Homework Chapter 5",
    course: "Advanced Calculus",
    instructor: "Dr. Robert Smith",
    dueDate: "2024-01-15",
    status: "pending",
    submittedDate: null,
    grade: null,
    description: "Complete exercises 1-20 from Chapter 5. Show all work.",
    attachments: ["homework_ch5.pdf"],
  },
  {
    id: 2,
    title: "Physics Lab Report: Pendulum Motion",
    course: "Classical Mechanics",
    instructor: "Prof. Sarah Johnson",
    dueDate: "2024-01-12",
    status: "submitted",
    submittedDate: "2024-01-11",
    grade: null,
    description: "Write a detailed lab report on the pendulum experiment.",
    attachments: ["lab_report_template.docx"],
  },
  {
    id: 3,
    title: "Essay: Impact of Technology on Society",
    course: "English Literature",
    instructor: "Ms. Emily Brown",
    dueDate: "2024-01-10",
    status: "graded",
    submittedDate: "2024-01-09",
    grade: "92",
    feedback: "Excellent analysis and well-structured arguments. Great work!",
    description: "Write a 1500-word essay on how technology has impacted society.",
    attachments: ["essay_guidelines.pdf"],
  },
  {
    id: 4,
    title: "Programming Assignment: Array Methods",
    course: "Advanced JavaScript",
    instructor: "Dr. James Wilson",
    dueDate: "2024-01-18",
    status: "pending",
    submittedDate: null,
    grade: null,
    description: "Implement various array manipulation methods in JavaScript.",
    attachments: ["assignment_js.pdf"],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Assignments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ file: null, notes: "" });

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "submitted":
        return <FileText className="h-4 w-4" />;
      case "graded":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "submitted":
        return <Badge variant="default">Submitted</Badge>;
      case "graded":
        return <Badge variant="success">Graded</Badge>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Track and submit your assignments</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {assignments.filter((a) => a.status === "pending").length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {assignments.filter((a) => a.status === "submitted").length}
              </p>
              <p className="text-sm text-muted-foreground">Submitted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {assignments.filter((a) => a.status === "graded").length}
              </p>
              <p className="text-sm text-muted-foreground">Graded</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filter */}
      <motion.div variants={item}>
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search assignments..."
          className="max-w-md"
        />
      </motion.div>

      {/* Assignments List */}
      <motion.div variants={item}>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <AssignmentsList assignments={filteredAssignments} />
          </TabsContent>
          <TabsContent value="pending">
            <AssignmentsList
              assignments={filteredAssignments.filter((a) => a.status === "pending")}
            />
          </TabsContent>
          <TabsContent value="submitted">
            <AssignmentsList
              assignments={filteredAssignments.filter((a) => a.status === "submitted")}
            />
          </TabsContent>
          <TabsContent value="graded">
            <AssignmentsList
              assignments={filteredAssignments.filter((a) => a.status === "graded")}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Assignment Detail Modal */}
      <Modal
        isOpen={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        title={selectedAssignment?.title}
        size="lg"
      >
        {selectedAssignment && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge>{selectedAssignment.course}</Badge>
              {getStatusBadge(selectedAssignment.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Instructor</p>
                <p className="font-medium">{selectedAssignment.instructor}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Due Date</p>
                <p className="font-medium">{new Date(selectedAssignment.dueDate).toLocaleDateString()}</p>
              </div>
              {selectedAssignment.submittedDate && (
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {new Date(selectedAssignment.submittedDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {selectedAssignment.grade && (
                <div>
                  <p className="text-muted-foreground">Grade</p>
                  <p className="font-medium text-emerald-600">{selectedAssignment.grade}%</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{selectedAssignment.description}</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-2">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {selectedAssignment.attachments.map((file) => (
                  <Button key={file} variant="outline" size="sm" className="gap-2">
                    <Download className="h-3 w-3" />
                    {file}
                  </Button>
                ))}
              </div>
            </div>

            {selectedAssignment.feedback && (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-sm font-medium text-emerald-800 mb-1">Instructor Feedback</p>
                <p className="text-sm text-emerald-700">{selectedAssignment.feedback}</p>
              </div>
            )}

            {selectedAssignment.status === "pending" && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => {
                    setSelectedAssignment(null);
                    setShowUploadModal(true);
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Submit Assignment
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Submit Assignment"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop your file here, or click to browse
            </p>
            <Button variant="outline" size="sm">
              Choose File
            </Button>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Notes (Optional)</label>
            <textarea
              className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm"
              placeholder="Add any notes for your instructor..."
              value={uploadData.notes}
              onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button>Submit</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

function AssignmentsList({ assignments }) {
  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No assignments found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <motion.div key={assignment.id} variants={item}>
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedAssignment(assignment)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`p-3 rounded-xl ${
                  assignment.status === "pending"
                    ? "bg-amber-100"
                    : assignment.status === "submitted"
                    ? "bg-blue-100"
                    : "bg-emerald-100"
                }`}
              >
                {assignment.status === "pending" ? (
                  <Clock className="h-5 w-5 text-amber-600" />
                ) : assignment.status === "submitted" ? (
                  <FileText className="h-5 w-5 text-blue-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{assignment.title}</h3>
                  {getStatusBadge(assignment.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {assignment.course}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {assignment.grade && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">{assignment.grade}%</p>
                  <p className="text-xs text-muted-foreground">Grade</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}