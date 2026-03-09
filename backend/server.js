import express from "express";
import cors from "cors";
import courseRoutes from "./routes/courseRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/courses", courseRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});