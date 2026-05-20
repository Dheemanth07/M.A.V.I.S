/**
 * @file MongoDB ObjectId validation helpers.
 */
import mongoose from "mongoose";
import AppError from "./AppError.js";

export const ensureValidObjectId = (id, label = "id") => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(`Invalid ${label}: ${id}`, 400);
    }
};
