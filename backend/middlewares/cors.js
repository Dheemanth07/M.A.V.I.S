import cors from "cors";    // Middleware for enabling CORS (Cross-Origin Resource Sharing)

const corsOptions = {       
    origin:"*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials:true,
};

export default corsOptions;