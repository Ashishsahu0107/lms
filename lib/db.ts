import mongoose from "mongoose";
import { models } from "@/lib/models";

const uri = (() => {
  const value = process.env.MONGODB_URI;
  if (!value) throw new Error("MONGODB_URI environment variable is required");
  return value;
})();

type Cache = { connection: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const root = globalThis as typeof globalThis & { mongooseCache?: Cache };
const cache = (root.mongooseCache ??= { connection: null, promise: null });

export async function connectDB() {
  if (cache.connection) return cache.connection;
  if (!cache.promise) cache.promise = mongoose.connect(uri, { bufferCommands: false });
  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
}

const relationPaths: Record<string, Record<string, [string, string, string]>> = {
  User: {
    teachingCourses: ["Course", "_id", "teacherId"], enrollments: ["Enrollment", "_id", "studentId"],
    assignedEnrollments: ["Enrollment", "_id", "assignedById"], achievements: ["Achievement", "_id", "userId"],
    courseRatings: ["CourseRating", "_id", "studentId"], quizzesCreated: ["Quiz", "_id", "createdById"],
    quizAttempts: ["QuizAttempt", "_id", "studentId"], assignmentsCreated: ["Assignment", "_id", "createdById"],
    submissions: ["Submission", "_id", "studentId"], attendanceAsStudent: ["Attendance", "_id", "studentId"],
    attendanceAsTeacher: ["Attendance", "_id", "teacherId"], attendanceMarkedBy: ["Attendance", "_id", "markedById"],
    attendanceSessions: ["AttendanceSession", "_id", "teacherId"], certificatesReceived: ["Certificate", "_id", "studentId"],
    certificatesIssued: ["Certificate", "_id", "issuedById"], messagesSent: ["Message", "_id", "senderId"],
    messagesReceived: ["Message", "_id", "recipientId"], notificationsSent: ["Notification", "_id", "senderId"],
    notificationsReceived: ["Notification", "_id", "recipientId"], notificationsReadBy: ["NotificationRead", "_id", "userId"],
    notes: ["Notes", "_id", "teacherId"], schedules: ["Schedule", "_id", "userId"],
    studentProgress: ["StudentProgress", "_id", "studentId"], lectureProgress: ["LectureProgress", "_id", "studentId"],
    studentNotes: ["StudentNote", "_id", "studentId"], securityLogs: ["SecurityLog", "_id", "userId"],
    aiChats: ["AIChat", "_id", "userId"], settings: ["Settings", "_id", "userId"],
  },
  Course: {
    modules: ["Module", "_id", "courseId"], enrollments: ["Enrollment", "_id", "courseId"], ratings: ["CourseRating", "_id", "courseId"],
    quizzes: ["Quiz", "_id", "courseId"], assignments: ["Assignment", "_id", "courseId"], attendances: ["Attendance", "_id", "courseId"],
    attendanceSessions: ["AttendanceSession", "_id", "courseId"], certificates: ["Certificate", "_id", "courseId"],
    notes: ["Notes", "_id", "courseId"], schedules: ["Schedule", "_id", "courseId"], studentProgress: ["StudentProgress", "_id", "courseId"],
  },
  Module: { topics: ["Topic", "_id", "moduleId"], quizzes: ["Quiz", "_id", "moduleId"], assignments: ["Assignment", "_id", "moduleId"] },
  Topic: { resources: ["TopicResource", "_id", "topicId"], quizzes: ["Quiz", "_id", "topicId"], assignments: ["Assignment", "_id", "topicId"], lectureProgress: ["LectureProgress", "_id", "topicId"], studentNotes: ["StudentNote", "_id", "topicId"] },
  StudentProgress: { lectureProgress: ["LectureProgress", "_id", "progressId"] },
  Quiz: { questions: ["Question", "_id", "quizId"], attempts: ["QuizAttempt", "_id", "quizId"] },
  Question: { attemptAnswers: ["AttemptAnswer", "_id", "questionId"] },
  QuizAttempt: { answers: ["AttemptAnswer", "_id", "attemptId"] },
  Assignment: { rubrics: ["Rubric", "_id", "assignmentId"], submissions: ["Submission", "_id", "assignmentId"] },
  Submission: { rubricEvaluation: ["RubricEvaluation", "_id", "submissionId"] },
  AttendanceSession: { attendances: ["Attendance", "_id", "sessionId"] },
  Message: { attachments: ["MessageAttachment", "_id", "messageId"] },
  Notification: { readBy: ["NotificationRead", "_id", "notificationId"] },
  AIChat: { messages: ["AIMessage", "_id", "chatId"] },
};

const modelByName = models as Record<string, any>;

function toMongoFilter(where: Record<string, any> = {}) {
  const filter: Record<string, any> = {};
  for (const [key, value] of Object.entries(where)) {
    if (["OR", "AND", "NOT"].includes(key)) {
      filter[`$${key.toLowerCase()}`] = Array.isArray(value)
        ? value.map((part) => toMongoFilter(part))
        : toMongoFilter(value);
      continue;
    }
    if (key === "id") {
      filter._id = value;
      continue;
    }
    if (key.includes("_") && value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(filter, toMongoFilter(value));
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      const operators: Record<string, any> = {};
      for (const [operator, operand] of Object.entries(value)) {
        if (operator === "mode") continue;
        if (["contains", "startsWith", "endsWith"].includes(operator)) {
          const escaped = String(operand).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          operators.$regex = operator === "startsWith" ? `^${escaped}` : operator === "endsWith" ? `${escaped}$` : escaped;
          if ((value as Record<string, any>).mode === "insensitive") operators.$options = "i";
        } else if (operator === "in") operators.$in = operand;
        else if (operator === "notIn") operators.$nin = operand;
        else if (operator === "not") operators.$ne = operand;
        else if (operator === "equals") operators.$eq = operand;
        else if (["gt", "gte", "lt", "lte"].includes(operator)) operators[`$${operator}`] = operand;
        else if (operator === "has") operators.$in = [operand];
        else if (operator === "hasSome") operators.$in = operand;
      }
      filter[key] = Object.keys(operators).length ? operators : toMongoFilter(value);
    } else {
      filter[key] = value;
    }
  }
  return filter;
}

function projection(selection: Record<string, boolean> = {}) {
  return Object.entries(selection).map(([field, included]) => `${included ? "" : "-"}${field === "id" ? "_id" : field}`).join(" ");
}

function populateOptions(modelName: string, include: Record<string, any> = {}): any[] {
  return Object.entries(include).flatMap(([path, config]) => {
    if (path === "_count" || !config) return [];
    const relation = relationPaths[modelName]?.[path];
    const nested = config === true ? {} : config;
    const item: Record<string, any> = { path };
    if (relation) item.model = modelByName[relation[0]];
    if (nested.select) item.select = projection(nested.select);
    if (nested.orderBy) item.options = { sort: Object.fromEntries(Object.entries(nested.orderBy).map(([key, dir]) => [key, dir === "asc" ? 1 : -1])) };
    if (nested.take) item.options = { ...item.options, perDocumentLimit: nested.take };
    if (nested.include) item.populate = populateOptions(relation?.[0] ?? "", nested.include);
    return [item];
  });
}

async function addCounts(modelName: string, doc: any, include: Record<string, any> = {}) {
  if (!include?._count || !doc) return doc;
  const plain = doc.toJSON ? doc.toJSON() : doc;
  const counts: Record<string, number> = {};
  for (const [path, enabled] of Object.entries(include._count.select ?? {})) {
    if (!enabled) continue;
    const relation = relationPaths[modelName]?.[path];
    counts[path] = relation ? await modelByName[relation[0]].countDocuments({ [relation[2]]: plain.id }) : 0;
  }
  plain._count = counts;
  return plain;
}

function updateDocument(data: Record<string, any> = {}) {
  const set: Record<string, any> = {};
  const inc: Record<string, number> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && "increment" in value) inc[key] = value.increment;
    else if (value && typeof value === "object" && "decrement" in value) inc[key] = -value.decrement;
    else if (value && typeof value === "object" && "set" in value) set[key] = value.set;
    else set[key] = value;
  }
  return { ...(Object.keys(set).length ? { $set: set } : {}), ...(Object.keys(inc).length ? { $inc: inc } : {}) };
}

function repository(modelName: string) {
  const Model = modelByName[modelName];
  return {
    findMany: async ({ where, skip, take, orderBy, select, include }: any = {}) => {
      await connectDB();
      let query = Model.find(toMongoFilter(where));
      if (skip) query = query.skip(skip);
      if (take !== undefined) query = query.limit(take);
      if (orderBy) query = query.sort(Object.fromEntries(Object.entries(orderBy).map(([key, dir]) => [key, dir === "asc" ? 1 : -1])));
      if (select) query = query.select(projection(select));
      for (const item of populateOptions(modelName, include)) query = query.populate(item);
      const docs = await query.exec();
      return Promise.all(docs.map((doc: any) => addCounts(modelName, doc, include)));
    },
    findUnique: async ({ where, select, include }: any) => {
      await connectDB();
      let query = Model.findOne(toMongoFilter(where));
      if (select) query = query.select(projection(select));
      for (const item of populateOptions(modelName, include)) query = query.populate(item);
      return addCounts(modelName, await query.exec(), include);
    },
    findFirst: async (args: any = {}) => repository(modelName).findMany({ ...args, take: 1 }).then((rows: any[]) => rows[0] ?? null),
    create: async ({ data, include, select }: any) => {
      await connectDB();
      let doc = await Model.create(data);
      for (const item of populateOptions(modelName, include)) await doc.populate(item);
      if (select) doc = await Model.findById(doc._id).select(projection(select));
      return addCounts(modelName, doc, include);
    },
    update: async ({ where, data, include, select }: any) => {
      await connectDB();
      let doc = await Model.findOneAndUpdate(toMongoFilter(where), updateDocument(data), { new: true, runValidators: true });
      if (!doc) throw new Error(`${modelName} not found`);
      for (const item of populateOptions(modelName, include)) await doc.populate(item);
      if (select) doc = await Model.findById(doc._id).select(projection(select));
      return addCounts(modelName, doc, include);
    },
    updateMany: async ({ where, data }: any) => {
      await connectDB();
      const result = await Model.updateMany(toMongoFilter(where), updateDocument(data));
      return { count: result.modifiedCount };
    },
    upsert: async ({ where, create, update, include, select }: any) => {
      await connectDB();
      let doc = await Model.findOneAndUpdate(toMongoFilter(where), { ...updateDocument(update), $setOnInsert: create }, { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true });
      for (const item of populateOptions(modelName, include)) await doc.populate(item);
      if (select) doc = await Model.findById(doc._id).select(projection(select));
      return addCounts(modelName, doc, include);
    },
    delete: async ({ where }: any) => {
      await connectDB();
      const doc = await Model.findOneAndDelete(toMongoFilter(where));
      if (!doc) throw new Error(`${modelName} not found`);
      return doc;
    },
    deleteMany: async ({ where }: any = {}) => {
      await connectDB();
      return Model.deleteMany(toMongoFilter(where));
    },
    count: async ({ where }: any = {}) => {
      await connectDB();
      return Model.countDocuments(toMongoFilter(where));
    },
  };
}

export const mongo = Object.fromEntries(
  Object.keys(modelByName).map((name) => [name[0].toLowerCase() + name.slice(1), repository(name)]),
) as Record<string, any>;

export default mongo;
