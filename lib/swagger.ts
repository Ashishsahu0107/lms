// lib/swagger.ts — Swagger/OpenAPI 3.0 specification for LMS Pro API
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LMS Pro API",
      version: "3.0.0",
      description:
        "Full-stack Learning Management System API built with Next.js 15, PostgreSQL (Prisma), and Socket.io. Supports Student, Teacher, and Super Admin roles.",
      contact: {
        name: "LMS Pro Team",
        email: "admin@lmspro.edu",
      },
      license: {
        name: "ISC",
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || "/api",
        description: "Active API Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from /api/auth/login",
        },
      },
      schemas: {
        // ── Success Response
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error message" },
          },
        },
        // ── User
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "clxyz123" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email" },
            role: {
              type: "string",
              enum: ["student", "teacher", "super_admin"],
            },
            avatar: { type: "string" },
            bio: { type: "string" },
            phone: { type: "string" },
            gender: { type: "string", enum: ["male", "female", "other"] },
            isActive: { type: "boolean" },
            status: {
              type: "string",
              enum: ["active", "suspended", "pending"],
            },
            isVerified: { type: "boolean" },
            xp: { type: "integer" },
            streak: { type: "integer" },
            badges: { type: "array", items: { type: "string" } },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ── Auth
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "admin@lmspro.edu",
            },
            password: { type: "string", example: "admin123" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                token: { type: "string" },
                user: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Jane Doe" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
        // ── Course
        Course: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            difficulty: {
              type: "string",
              enum: ["beginner", "intermediate", "advanced"],
            },
            price: { type: "number" },
            thumbnail: { type: "string" },
            duration: { type: "integer" },
            status: {
              type: "string",
              enum: ["draft", "published", "archived"],
            },
            averageRating: { type: "number" },
            totalRatings: { type: "integer" },
            teacherId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ── Module
        Module: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            order: { type: "integer" },
            courseId: { type: "string" },
            topics: {
              type: "array",
              items: { $ref: "#/components/schemas/Topic" },
            },
          },
        },
        // ── Topic
        Topic: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            content: { type: "string" },
            videoUrl: { type: "string" },
            duration: { type: "integer" },
            moduleId: { type: "string" },
          },
        },
        // ── Quiz
        Quiz: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            courseId: { type: "string" },
            duration: { type: "integer" },
            totalMarks: { type: "integer" },
            passingMarks: { type: "integer" },
            quizType: {
              type: "string",
              enum: ["practice", "exam", "homework"],
            },
            attemptLimit: { type: "integer" },
            status: { type: "string", enum: ["draft", "published", "closed"] },
          },
        },
        // ── Assignment
        Assignment: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            courseId: { type: "string" },
            dueDate: { type: "string", format: "date-time" },
            totalMarks: { type: "integer" },
            assignmentType: {
              type: "string",
              enum: ["written", "mcq", "code", "document"],
            },
            status: { type: "string", enum: ["draft", "published", "closed"] },
          },
        },
        // ── Message
        Message: {
          type: "object",
          properties: {
            id: { type: "string" },
            senderId: { type: "string" },
            recipientId: { type: "string" },
            content: { type: "string" },
            messageType: {
              type: "string",
              enum: ["text", "image", "video", "audio", "file", "system"],
            },
            read: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ── Notification
        Notification: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            message: { type: "string" },
            type: { type: "string" },
            targetRole: { type: "string" },
            read: { type: "boolean" },
            scheduledAt: { type: "string", format: "date-time" },
          },
        },
        // ── Enrollment
        Enrollment: {
          type: "object",
          properties: {
            id: { type: "string" },
            studentId: { type: "string" },
            courseId: { type: "string" },
            progress: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ── Certificate
        Certificate: {
          type: "object",
          properties: {
            id: { type: "string" },
            certificateId: { type: "string" },
            studentId: { type: "string" },
            courseId: { type: "string" },
            completionPercentage: { type: "number" },
            status: {
              type: "string",
              enum: ["Issued", "Pending", "Approved", "Rejected"],
            },
            issueDate: { type: "string", format: "date-time" },
          },
        },
        // ── Attendance
        Attendance: {
          type: "object",
          properties: {
            id: { type: "string" },
            studentId: { type: "string" },
            courseId: { type: "string" },
            date: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: ["present", "absent", "late", "leave"],
            },
            remarks: { type: "string" },
          },
        },
        // ── Pagination
        PaginationMeta: {
          type: "object",
          properties: {
            total: { type: "integer" },
            page: { type: "integer" },
            limit: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Authentication token missing or invalid",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        Forbidden: {
          description: "Insufficient permissions for this action",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        BadRequest: {
          description: "Invalid request body or parameters",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Authentication & identity management" },
      { name: "Courses", description: "Course catalog and management" },
      { name: "Modules", description: "Course module management" },
      { name: "Topics", description: "Module topic management" },
      { name: "Enrollments", description: "Student enrollment" },
      { name: "Quizzes", description: "Quiz management and attempts" },
      { name: "Quiz Attempts", description: "Student quiz submissions" },
      { name: "Assignments", description: "Assignment management" },
      {
        name: "Submissions",
        description: "Assignment submissions and grading",
      },
      { name: "Student", description: "Student dashboard APIs" },
      { name: "Teacher", description: "Teacher dashboard APIs" },
      { name: "Admin", description: "Super admin APIs" },
      { name: "Attendance", description: "Attendance tracking" },
      { name: "Certificates", description: "Certificate issuance" },
      { name: "Messages", description: "Real-time messaging" },
      { name: "Notifications", description: "Notifications system" },
      { name: "Notes", description: "Teacher course notes" },
      { name: "Schedules", description: "Class scheduling" },
      { name: "Search", description: "Global search" },
      { name: "AI", description: "AI study tutor chat" },
      { name: "Settings", description: "User and system settings" },
      { name: "Health", description: "System health checks" },
    ],
  },
  apis: ["./app/api/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
