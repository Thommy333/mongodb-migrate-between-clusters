/**
 * Copyright 2022 The Catenating Company (Auto-Pilot)
 * @author Thom Trentelman
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// Create connections
export const sourceConnection = await mongoose.createConnection(process.env.MONGODB_URI_SOURCE).asPromise();
export const targetConnection = await mongoose.createConnection(process.env.MONGODB_URI_TARGET).asPromise();
