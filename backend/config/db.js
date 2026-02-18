import mongoose from "mongoose";  // ODM (Object Data Modeling) library for MongoDB

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Database connection failed:", error.message);
        setTimeout(connectDB, 5000); // retry after 5s
    }
};

export default connectDB;
