// src/pages/student/assignments/Assignments.jsx

import React, { useState } from "react";

import { motion } from "framer-motion";

import {
  FileText,
  Clock,
  CheckCircle2,
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
} from "../../../components/ui/Card";

import { Button } from "../../../components/ui/Button";

import { SearchBar } from "../../../components/ui/SearchBar";

import { Modal } from "../../../components/ui/Modal";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/Tabs";

// ======================================================
// DATA
// ======================================================

const assignments = [
  {
    id: 1,
    title: "Mathematics Homework Chapter 5",
    course: "Advanced Calculus",
    instructor: "Dr. Robert Smith",
    dueDate: "2024-01-15",
    status: "pending",
    grade: null,
  },

  {
    id: 2,
    title: "Physics Lab Report",
    course: "Classical Mechanics",
    instructor: "Prof. Sarah Johnson",
    dueDate: "2024-01-12",
    status: "submitted",
    grade: null,
  },

  {
    id: 3,
    title: "Essay: Technology & Society",
    course: "English Literature",
    instructor: "Ms. Emily Brown",
    dueDate: "2024-01-10",
    status: "graded",
    grade: "92",
  },

  {
    id: 4,
    title: "Programming Assignment",
    course: "Advanced JavaScript",
    instructor: "Dr. James Wilson",
    dueDate: "2024-01-18",
    status: "pending",
    grade: null,
  },
];

// ======================================================
// ANIMATION
// ======================================================

const container = {
  hidden: { opacity: 0 },

  show: {
    opacity: 1,

    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  show: {
    opacity: 1,
    y: 0,
  },
};

// ======================================================
// STATUS BADGE
// ======================================================

const getStatusBadge = (status) => {

  const styles = {
    pending:
      "badge badge-warning text-white",

    submitted:
      "badge badge-info text-white",

    graded:
      "badge badge-success text-white",
  };

  return (
    <span
      className={`rounded-xl px-3 py-2 text-xs font-medium ${
        styles[status]
      }`}
    >
      {status}
    </span>
  );
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function Assignments() {

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedAssignment, setSelectedAssignment] =
    useState(null);

  const [showUploadModal, setShowUploadModal] =
    useState(false);

  // ======================================================
  // FILTER
  // ======================================================

  const filteredAssignments =
    assignments.filter((assignment) =>
      assignment.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

  return (

    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <motion.div
        variants={item}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >

        <div>

          <h1 className="text-3xl font-bold text-gradient">

            Assignments

          </h1>

          <p className="text-muted-foreground">

            Track and manage your assignments

          </p>

        </div>

        <Button className="btn btn-primary rounded-2xl gap-2">

          <Download className="h-4 w-4" />

          Download All

        </Button>

      </motion.div>

      {/* ================================================= */}
      {/* STATS */}
      {/* ================================================= */}

      <motion.div
        variants={item}
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >

        <Card className="bg-base-100 shadow-xl border border-base-300">

          <CardContent className="flex items-center gap-4 p-6">

            <div className="rounded-2xl bg-warning/15 p-4">

              <Clock className="h-7 w-7 text-warning" />

            </div>

            <div>

              <h2 className="text-3xl font-bold">

                {
                  assignments.filter(
                    (a) =>
                      a.status === "pending"
                  ).length
                }

              </h2>

              <p className="text-sm text-muted-foreground">

                Pending

              </p>

            </div>

          </CardContent>

        </Card>

        <Card className="bg-base-100 shadow-xl border border-base-300">

          <CardContent className="flex items-center gap-4 p-6">

            <div className="rounded-2xl bg-info/15 p-4">

              <Upload className="h-7 w-7 text-info" />

            </div>

            <div>

              <h2 className="text-3xl font-bold">

                {
                  assignments.filter(
                    (a) =>
                      a.status === "submitted"
                  ).length
                }

              </h2>

              <p className="text-sm text-muted-foreground">

                Submitted

              </p>

            </div>

          </CardContent>

        </Card>

        <Card className="bg-base-100 shadow-xl border border-base-300">

          <CardContent className="flex items-center gap-4 p-6">

            <div className="rounded-2xl bg-success/15 p-4">

              <CheckCircle2 className="h-7 w-7 text-success" />

            </div>

            <div>

              <h2 className="text-3xl font-bold">

                {
                  assignments.filter(
                    (a) =>
                      a.status === "graded"
                  ).length
                }

              </h2>

              <p className="text-sm text-muted-foreground">

                Graded

              </p>

            </div>

          </CardContent>

        </Card>

      </motion.div>

      {/* ================================================= */}
      {/* SEARCH */}
      {/* ================================================= */}

      <motion.div variants={item}>

        <SearchBar
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          placeholder="Search assignments..."
          className="max-w-md"
        />

      </motion.div>

      {/* ================================================= */}
      {/* TABS */}
      {/* ================================================= */}

      <motion.div variants={item}>

        <Tabs defaultValue="all">

          <TabsList>

            <TabsTrigger value="all">
              All
            </TabsTrigger>

            <TabsTrigger value="pending">
              Pending
            </TabsTrigger>

            <TabsTrigger value="submitted">
              Submitted
            </TabsTrigger>

            <TabsTrigger value="graded">
              Graded
            </TabsTrigger>

          </TabsList>

          <TabsContent value="all">

            <AssignmentsList
              assignments={filteredAssignments}
              setSelectedAssignment={
                setSelectedAssignment
              }
            />

          </TabsContent>

        </Tabs>

      </motion.div>

      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      <Modal
        isOpen={!!selectedAssignment}
        onClose={() =>
          setSelectedAssignment(null)
        }
        title={selectedAssignment?.title}
      >

        {selectedAssignment && (

          <div className="space-y-4">

            <div className="flex items-center gap-3">

              {getStatusBadge(
                selectedAssignment.status
              )}

            </div>

            <div className="rounded-2xl border border-base-300 bg-base-200 p-4">

              <p className="text-sm text-muted-foreground">

                Course

              </p>

              <h3 className="font-semibold">

                {selectedAssignment.course}

              </h3>

            </div>

            <div className="rounded-2xl border border-base-300 bg-base-200 p-4">

              <p className="text-sm text-muted-foreground">

                Instructor

              </p>

              <h3 className="font-semibold">

                {
                  selectedAssignment.instructor
                }

              </h3>

            </div>

            <Button
              className="btn btn-primary w-full rounded-2xl gap-2"
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

      </Modal>

      {/* ================================================= */}
      {/* UPLOAD MODAL */}
      {/* ================================================= */}

      <Modal
        isOpen={showUploadModal}
        onClose={() =>
          setShowUploadModal(false)
        }
        title="Upload Assignment"
      >

        <div className="space-y-4">

          <div className="rounded-2xl border-2 border-dashed border-base-300 bg-base-200 p-10 text-center">

            <Upload className="mx-auto mb-3 h-10 w-10 text-primary" />

            <p className="mb-4 text-sm text-muted-foreground">

              Drag and drop file here

            </p>

            <Button className="btn btn-primary rounded-xl">

              Choose File

            </Button>

          </div>

          <Button className="btn btn-success w-full rounded-2xl">

            Submit

          </Button>

        </div>

      </Modal>

    </motion.div>
  );
}

// ======================================================
// LIST COMPONENT
// ======================================================

function AssignmentsList({
  assignments,
  setSelectedAssignment,
}) {

  if (assignments.length === 0) {

    return (

      <Card className="bg-base-100 shadow-xl">

        <CardContent className="py-20 text-center">

          <FileText className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />

          <h2 className="text-lg font-semibold">

            No Assignments Found

          </h2>

        </CardContent>

      </Card>

    );
  }

  return (

    <div className="space-y-4">

      {assignments.map((assignment) => (

        <motion.div
          key={assignment.id}
          variants={item}
        >

          <Card
            onClick={() =>
              setSelectedAssignment(
                assignment
              )
            }
            className="cursor-pointer border border-base-300 bg-base-100 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >

            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">

              <div className="rounded-2xl bg-primary/10 p-4">

                <FileText className="h-7 w-7 text-primary" />

              </div>

              <div className="flex-1">

                <div className="mb-2 flex items-center gap-3">

                  <h2 className="text-lg font-semibold">

                    {assignment.title}

                  </h2>

                  {getStatusBadge(
                    assignment.status
                  )}

                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">

                  <span className="flex items-center gap-1">

                    <BookOpen className="h-4 w-4" />

                    {assignment.course}

                  </span>

                  <span className="flex items-center gap-1">

                    <Calendar className="h-4 w-4" />

                    {
                      assignment.dueDate
                    }

                  </span>

                </div>

              </div>

              {assignment.grade && (

                <div className="text-right">

                  <h2 className="text-3xl font-bold text-success">

                    {assignment.grade}%

                  </h2>

                  <p className="text-sm text-muted-foreground">

                    Grade

                  </p>

                </div>

              )}

            </CardContent>

          </Card>

        </motion.div>

      ))}

    </div>
  );
}