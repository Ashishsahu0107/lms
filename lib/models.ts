import mongoose, { Schema, Types } from "mongoose";

const id = { type: String, default: () => new Types.ObjectId().toString() };
const string = { type: String, default: "" };
const strings = { type: [String], default: [] };
const number = { type: Number, default: 0 };
const boolean = { type: Boolean, default: false };

type FieldDefinition = Record<string, unknown>;

const definitions: Record<string, FieldDefinition> = {
    User: {
        name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true }, role: { type: String, default: "student" }, avatar: string,
        bio: string, phone: string, gender: { type: String, default: "other" }, dateOfBirth: Date,
        qualification: string, specialization: string, experience: number, isActive: { type: Boolean, default: true },
        status: { type: String, default: "active" }, isVerified: boolean, isEmailVerified: boolean,
        isOnline: boolean, lastSeen: Date, socketId: string, refreshToken: String, passwordChangedAt: Date,
        verificationOTP: String, verificationOTPExpires: Date, resetPasswordOTP: String, resetPasswordOTPExpires: Date,
        resetOTP: String, resetOTPExpire: Date, xp: number, streak: number, lastActiveDate: Date, badges: strings,
        preferences: { type: Schema.Types.Mixed, default: () => ({ theme: "light", notifications: { email: true, quizAlerts: true, assignmentAlerts: true, courseNotifications: true }, privacy: { accountVisibility: "public", activityVisibility: "public" }, twoFactorEnabled: false }) },
    },
    Achievement: { title: string, description: string, unlockedAt: { type: Date, default: Date.now }, userId: { type: String, ref: "User" } },
    Course: {
        title: { type: String, required: true }, description: string, category: string, tags: strings,
        difficulty: { type: String, default: "beginner" }, price: number, thumbnail: string, thumbnailKey: string,
        duration: number, status: { type: String, default: "draft" }, averageRating: number, totalRatings: number,
        teacherId: { type: String, ref: "User", required: true },
    },
    CourseRating: { courseId: { type: String, ref: "Course" }, studentId: { type: String, ref: "User" }, score: number, comment: string },
    Module: { title: string, order: number, courseId: { type: String, ref: "Course" } },
    Topic: { title: string, content: string, videoUrl: string, topicType: { type: String, default: "doc" }, attachments: strings, duration: number, order: number, moduleId: { type: String, ref: "Module" } },
    TopicResource: { title: string, fileUrl: string, resourceType: { type: String, default: "link" }, description: string, topicId: { type: String, ref: "Topic" } },
    TopicDoc: { title: { type: String, default: "Untitled Note" }, content: string, status: { type: String, default: "draft" }, topicId: { type: String, ref: "Topic" }, authorId: { type: String, ref: "User" } },
    Enrollment: { studentId: { type: String, ref: "User" }, courseId: { type: String, ref: "Course" }, assignedById: { type: String, ref: "User" }, progress: number, completedTopics: strings },
    StudentProgress: { studentId: { type: String, ref: "User" }, courseId: { type: String, ref: "Course" }, progress: number, totalWatchTime: number, enrolledAt: { type: Date, default: Date.now }, completedAt: Date, lastAccessedAt: { type: Date, default: Date.now }, lastAccessedTopicId: { type: String, ref: "Topic" } },
    LectureProgress: { studentId: { type: String, ref: "User" }, topicId: { type: String, ref: "Topic" }, progressId: { type: String, ref: "StudentProgress" }, completed: boolean, completedAt: Date, watchPosition: number, duration: number, watchTime: number },
    Quiz: { title: string, description: string, instructions: string, courseId: { type: String, ref: "Course" }, moduleId: { type: String, ref: "Module" }, topicId: { type: String, ref: "Topic" }, createdById: { type: String, ref: "User" }, duration: number, totalMarks: number, passingMarks: number, quizType: { type: String, default: "exam" }, attemptLimit: number, shuffleQuestions: boolean, shuffleOptions: boolean, startDate: Date, endDate: Date, negativeMarking: boolean, status: { type: String, default: "published" } },
    Question: { quizId: { type: String, ref: "Quiz" }, type: String, question: string, options: strings, correctAnswer: strings, explanation: string, marks: { type: Number, default: 5 }, difficulty: { type: String, default: "medium" } },
    QuizAttempt: { studentId: { type: String, ref: "User" }, quizId: { type: String, ref: "Quiz" }, score: number, status: { type: String, default: "ongoing" }, accuracy: number, timeSpent: number, submittedAt: Date },
    AttemptAnswer: { attemptId: { type: String, ref: "QuizAttempt" }, questionId: { type: String, ref: "Question" }, selectedAnswers: strings, isFlagged: boolean },
    Assignment: { title: string, description: string, instructions: string, courseId: { type: String, ref: "Course" }, moduleId: { type: String, ref: "Module" }, topicId: { type: String, ref: "Topic" }, createdById: { type: String, ref: "User" }, attachments: strings, dueDate: Date, totalMarks: { type: Number, default: 100 }, assignmentType: { type: String, default: "written" }, generatedFromDocument: boolean, status: { type: String, default: "published" } },
    Rubric: { assignmentId: { type: String, ref: "Assignment" }, criterion: string, maxPoints: number, description: string },
    Submission: { assignmentId: { type: String, ref: "Assignment" }, studentId: { type: String, ref: "User" }, files: strings, textAnswer: string, submittedAt: { type: Date, default: Date.now }, marks: Number, feedback: string, status: { type: String, default: "pending" } },
    RubricEvaluation: { submissionId: { type: String, ref: "Submission" }, criterionTitle: string, score: number, feedback: string },
    AttendanceSession: { courseId: { type: String, ref: "Course" }, teacherId: { type: String, ref: "User" }, title: string, date: Date, startTime: string, endTime: string, description: string, marked: boolean },
    Attendance: { studentId: { type: String, ref: "User" }, courseId: { type: String, ref: "Course" }, teacherId: { type: String, ref: "User" }, date: Date, status: { type: String, default: "present" }, remarks: string, markedById: { type: String, ref: "User" }, sessionId: { type: String, ref: "AttendanceSession" } },
    Certificate: { studentId: { type: String, ref: "User" }, courseId: { type: String, ref: "Course" }, issuedById: { type: String, ref: "User" }, certificateId: { type: String, unique: true }, issueDate: { type: Date, default: Date.now }, completionPercentage: number, certificateUrl: string, status: { type: String, default: "Issued" } },
    Message: { senderId: { type: String, ref: "User" }, recipientId: { type: String, ref: "User" }, groupId: String, content: string, messageType: { type: String, default: "text" }, read: boolean, delivered: boolean, deleted: boolean, readAt: Date, deliveredAt: Date, edited: boolean, editedAt: Date },
    MessageAttachment: { messageId: { type: String, ref: "Message" }, url: string, type: { type: String, default: "file" }, fileName: string, fileSize: number },
    Notification: { senderId: { type: String, ref: "User" }, recipientId: { type: String, ref: "User" }, targetRole: { type: String, default: "all" }, title: string, message: string, type: { type: String, default: "announcement" }, scheduledAt: { type: Date, default: Date.now }, read: boolean },
    NotificationRead: { notificationId: { type: String, ref: "Notification" }, userId: { type: String, ref: "User" }, readAt: Date },
    Notes: { title: string, content: string, fileUrl: string, courseId: { type: String, ref: "Course" }, teacherId: { type: String, ref: "User" } },
    StudentNote: { studentId: { type: String, ref: "User" }, topicId: { type: String, ref: "Topic" }, content: string, timestamp: number },
    Schedule: { title: string, description: string, type: { type: String, default: "class" }, startDate: Date, endDate: Date, courseId: { type: String, ref: "Course" }, userId: { type: String, ref: "User" }, meetingUrl: string, meetingId: string },
    Settings: { userId: { type: String, ref: "User", unique: true }, maintenanceMode: boolean, allowRegistration: { type: Boolean, default: true }, maxLoginAttempts: { type: Number, default: 5 }, sessionTimeout: { type: Number, default: 30 }, extraData: Schema.Types.Mixed },
    SecurityLog: { userId: { type: String, ref: "User" }, action: string, details: string, ip: string, device: string, severity: { type: String, default: "low" } },
    AIChat: { userId: { type: String, ref: "User" }, title: { type: String, default: "New Chat" } },
    AIMessage: { chatId: { type: String, ref: "AIChat" }, role: { type: String, default: "user" }, content: string },
    ContactRequest: { name: string, email: string, phone: String, subject: string, message: string, status: { type: String, default: "NEW" } },
};

const options: mongoose.SchemaOptions = {
    strict: false,
    timestamps: true,
    versionKey: false,
    toJSON: {
        virtuals: true,
        transform: (_document, rawValue) => {
            const value = rawValue as { _id?: unknown; id?: string; [key: string]: any };
            value.id = String(value._id);
            delete value._id;
            return value;
        },
    },
    toObject: {
        virtuals: true,
        transform: (_document, rawValue) => {
            const value = rawValue as { _id?: unknown; id?: string; [key: string]: any };
            value.id = String(value._id);
            delete value._id;
            return value;
        },
    },
};

const virtualRelations: Record<string, Record<string, [string, string, boolean]>> = {
    User: {
        teachingCourses: ["Course", "teacherId", false], enrollments: ["Enrollment", "studentId", false],
        assignedEnrollments: ["Enrollment", "assignedById", false], achievements: ["Achievement", "userId", false],
        courseRatings: ["CourseRating", "studentId", false], quizzesCreated: ["Quiz", "createdById", false],
        quizAttempts: ["QuizAttempt", "studentId", false], assignmentsCreated: ["Assignment", "createdById", false],
        submissions: ["Submission", "studentId", false], attendanceAsStudent: ["Attendance", "studentId", false],
        attendanceAsTeacher: ["Attendance", "teacherId", false], attendanceMarkedBy: ["Attendance", "markedById", false],
        attendanceSessions: ["AttendanceSession", "teacherId", false], certificatesReceived: ["Certificate", "studentId", false],
        certificatesIssued: ["Certificate", "issuedById", false], messagesSent: ["Message", "senderId", false],
        messagesReceived: ["Message", "recipientId", false], notificationsSent: ["Notification", "senderId", false],
        notificationsReceived: ["Notification", "recipientId", false], notificationsReadBy: ["NotificationRead", "userId", false],
        notes: ["Notes", "teacherId", false], schedules: ["Schedule", "userId", false],
        studentProgress: ["StudentProgress", "studentId", false], lectureProgress: ["LectureProgress", "studentId", false],
        studentNotes: ["StudentNote", "studentId", false], securityLogs: ["SecurityLog", "userId", false],
        aiChats: ["AIChat", "userId", false], settings: ["Settings", "userId", true],
    },
    Course: {
        modules: ["Module", "courseId", false], enrollments: ["Enrollment", "courseId", false], ratings: ["CourseRating", "courseId", false],
        quizzes: ["Quiz", "courseId", false], assignments: ["Assignment", "courseId", false], attendances: ["Attendance", "courseId", false],
        attendanceSessions: ["AttendanceSession", "courseId", false], certificates: ["Certificate", "courseId", false],
        notes: ["Notes", "courseId", false], schedules: ["Schedule", "courseId", false], studentProgress: ["StudentProgress", "courseId", false],
    },
    Module: { topics: ["Topic", "moduleId", false], quizzes: ["Quiz", "moduleId", false], assignments: ["Assignment", "moduleId", false] },
    Topic: { resources: ["TopicResource", "topicId", false], docs: ["TopicDoc", "topicId", false], quizzes: ["Quiz", "topicId", false], assignments: ["Assignment", "topicId", false], lectureProgress: ["LectureProgress", "topicId", false], studentNotes: ["StudentNote", "topicId", false] },
    StudentProgress: { lectureProgress: ["LectureProgress", "progressId", false] },
    Quiz: { questions: ["Question", "quizId", false], attempts: ["QuizAttempt", "quizId", false] },
    Question: { attemptAnswers: ["AttemptAnswer", "questionId", false] },
    QuizAttempt: { answers: ["AttemptAnswer", "attemptId", false] },
    Assignment: { rubrics: ["Rubric", "assignmentId", false], submissions: ["Submission", "assignmentId", false] },
    Submission: { rubricEvaluation: ["RubricEvaluation", "submissionId", false] },
    AttendanceSession: { attendances: ["Attendance", "sessionId", false] },
    Message: { attachments: ["MessageAttachment", "messageId", false] },
    Notification: { readBy: ["NotificationRead", "notificationId", false] },
    AIChat: { messages: ["AIMessage", "chatId", false] },
};

const referenceRelations: Record<string, Record<string, [string, string]>> = {
    Course: { teacher: ["User", "teacherId"] },
    CourseRating: { course: ["Course", "courseId"], student: ["User", "studentId"] },
    Module: { course: ["Course", "courseId"] },
    Topic: { module: ["Module", "moduleId"] },
    TopicResource: { topic: ["Topic", "topicId"] },
    Enrollment: { student: ["User", "studentId"], course: ["Course", "courseId"], assignedBy: ["User", "assignedById"] },
    StudentProgress: { student: ["User", "studentId"], course: ["Course", "courseId"], lastAccessedTopic: ["Topic", "lastAccessedTopicId"] },
    LectureProgress: { student: ["User", "studentId"], topic: ["Topic", "topicId"], studentProgress: ["StudentProgress", "progressId"] },
    Quiz: { course: ["Course", "courseId"], module: ["Module", "moduleId"], topic: ["Topic", "topicId"], createdBy: ["User", "createdById"] },
    Question: { quiz: ["Quiz", "quizId"] },
    QuizAttempt: { student: ["User", "studentId"], quiz: ["Quiz", "quizId"] },
    AttemptAnswer: { attempt: ["QuizAttempt", "attemptId"], question: ["Question", "questionId"] },
    Assignment: { course: ["Course", "courseId"], module: ["Module", "moduleId"], topic: ["Topic", "topicId"], createdBy: ["User", "createdById"] },
    Rubric: { assignment: ["Assignment", "assignmentId"] },
    Submission: { assignment: ["Assignment", "assignmentId"], student: ["User", "studentId"] },
    RubricEvaluation: { submission: ["Submission", "submissionId"] },
    AttendanceSession: { course: ["Course", "courseId"], teacher: ["User", "teacherId"] },
    Attendance: { student: ["User", "studentId"], course: ["Course", "courseId"], teacher: ["User", "teacherId"], markedBy: ["User", "markedById"], session: ["AttendanceSession", "sessionId"] },
    Certificate: { student: ["User", "studentId"], course: ["Course", "courseId"], issuedBy: ["User", "issuedById"] },
    Message: { sender: ["User", "senderId"], recipient: ["User", "recipientId"] },
    MessageAttachment: { message: ["Message", "messageId"] },
    Notification: { sender: ["User", "senderId"], recipient: ["User", "recipientId"] },
    NotificationRead: { notification: ["Notification", "notificationId"], user: ["User", "userId"] },
    Notes: { course: ["Course", "courseId"], teacher: ["User", "teacherId"] },
    StudentNote: { student: ["User", "studentId"], topic: ["Topic", "topicId"] },
    Schedule: { course: ["Course", "courseId"], user: ["User", "userId"] },
    Settings: { user: ["User", "userId"] },
    SecurityLog: { user: ["User", "userId"] },
    AIChat: { user: ["User", "userId"] },
    AIMessage: { chat: ["AIChat", "chatId"] },
};

const uniqueIndexes: Record<string, string[][]> = {
    CourseRating: [["courseId", "studentId"]],
    Enrollment: [["studentId", "courseId"]],
    StudentProgress: [["studentId", "courseId"]],
    LectureProgress: [["studentId", "topicId"]],
    Submission: [["studentId", "assignmentId"]],
    Attendance: [["studentId", "courseId", "date"]],
    Certificate: [["studentId", "courseId"]],
    NotificationRead: [["notificationId", "userId"]],
};

export const models = Object.fromEntries(
    Object.entries(definitions).map(([name, fields]) => {
        const schema = new Schema({ _id: id, ...fields }, options);
        for (const [path, [ref, foreignField, justOne]] of Object.entries(virtualRelations[name] ?? {})) {
            schema.virtual(path, { ref, localField: "_id", foreignField, justOne });
        }
        for (const [path, [ref, localField]] of Object.entries(referenceRelations[name] ?? {})) {
            schema.virtual(path, { ref, localField, foreignField: "_id", justOne: true });
        }
        for (const indexFields of uniqueIndexes[name] ?? []) {
            schema.index(Object.fromEntries(indexFields.map((field) => [field, 1])), { unique: true });
        }
        return [name, mongoose.models[name] ?? mongoose.model(name, schema)];
    }),
);

export const User = models.User;
export const Achievement = models.Achievement;
export const Course = models.Course;
export const CourseRating = models.CourseRating;
export const Module = models.Module;
export const Topic = models.Topic;
export const TopicResource = models.TopicResource;
export const Enrollment = models.Enrollment;
export const StudentProgress = models.StudentProgress;
export const LectureProgress = models.LectureProgress;
export const Quiz = models.Quiz;
export const Question = models.Question;
export const QuizAttempt = models.QuizAttempt;
export const AttemptAnswer = models.AttemptAnswer;
export const Assignment = models.Assignment;
export const Rubric = models.Rubric;
export const Submission = models.Submission;
export const RubricEvaluation = models.RubricEvaluation;
export const AttendanceSession = models.AttendanceSession;
export const Attendance = models.Attendance;
export const Certificate = models.Certificate;
export const Message = models.Message;
export const MessageAttachment = models.MessageAttachment;
export const Notification = models.Notification;
export const NotificationRead = models.NotificationRead;
export const Notes = models.Notes;
export const StudentNote = models.StudentNote;
export const Schedule = models.Schedule;
export const Settings = models.Settings;
export const SecurityLog = models.SecurityLog;
export const AIChat = models.AIChat;
export const AIMessage = models.AIMessage;
export const ContactRequest = models.ContactRequest;
