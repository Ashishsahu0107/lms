import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { Module } from "../models/Module.js";
import { Topic } from "../models/Topic.js";

// =====================================
// CREATE TOPIC
// =====================================
export async function createTopicController(req, res, next) {
  try {
    const {
      title,
      content,
      videoUrl,
      attachments,
      resources,
      duration,
      moduleId,
    } = req.body ?? {};

    if (!title || !moduleId) {
      throw new BadRequestError("Title and Module ID are required");
    }

    const parentModule = await Module.findById(moduleId);
    if (!parentModule) {
      throw new NotFoundError("Module not found");
    }

    const newTopic = await Topic.create({
      title,
      content: content || "",
      videoUrl: videoUrl || "",
      attachments: attachments || [],
      resources: resources || [],
      duration: duration || 0,
      moduleId,
    });

    // Add topic reference to parent Module
    parentModule.topics.push(newTopic._id);
    await parentModule.save();

    return res.status(201).json({
      success: true,
      message: "Topic created successfully",
      data: newTopic,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// UPDATE TOPIC
// =====================================
export async function updateTopicController(req, res, next) {
  try {
    const { id } = req.params;

    const updatedTopic = await Topic.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedTopic) {
      throw new NotFoundError("Topic not found");
    }

    return res.status(200).json({
      success: true,
      message: "Topic updated successfully",
      data: updatedTopic,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// DELETE TOPIC
// =====================================
export async function deleteTopicController(req, res, next) {
  try {
    const { id } = req.params;

    const targetTopic = await Topic.findById(id);
    if (!targetTopic) {
      throw new NotFoundError("Topic not found");
    }

    // Pull ref from Module topics array
    await Module.findByIdAndUpdate(targetTopic.moduleId, {
      $pull: { topics: id },
    });

    await Topic.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
