import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { Course } from "../models/Course.js";
import { Module } from "../models/Module.js";
import { Topic } from "../models/Topic.js";

// =====================================
// GET MODULE BY ID
// =====================================
export async function getModuleByIdController(req, res, next) {
  try {
    const { id } = req.params;
    const mod = await Module.findById(id).populate("topics");
    if (!mod) throw new NotFoundError("Module not found");
    return res
      .status(200)
      .json({ success: true, message: "Module fetched", data: mod });
  } catch (err) {
    next(err);
  }
}

// =====================================
// CREATE MODULE
// =====================================
export async function createModuleController(req, res, next) {
  try {
    const { title, order, courseId } = req.body ?? {};

    if (!title || !courseId) {
      throw new BadRequestError("Title and Course ID are required");
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    const newModule = await Module.create({
      title,
      order: order || 0,
      courseId,
      topics: [],
    });

    // Add module reference to Course
    course.modules.push(newModule._id);
    await course.save();

    return res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: newModule,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// UPDATE MODULE
// =====================================
export async function updateModuleController(req, res, next) {
  try {
    const { id } = req.params;

    const updatedModule = await Module.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    if (!updatedModule) {
      throw new NotFoundError("Module not found");
    }

    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: updatedModule,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// DELETE MODULE (Cascade Aware)
// =====================================
export async function deleteModuleController(req, res, next) {
  try {
    const { id } = req.params;

    const targetModule = await Module.findById(id);
    if (!targetModule) {
      throw new NotFoundError("Module not found");
    }

    // Cascade delete associated child Topics
    await Topic.deleteMany({ moduleId: id });

    // Pull ref from Course modules array
    await Course.findByIdAndUpdate(targetModule.courseId, {
      $pull: { modules: id },
    });

    await Module.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Module and associated topics deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
