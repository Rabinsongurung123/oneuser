import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware";
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" } });
});

app.use(notFoundHandler);
app.use(errorHandler);


export default app;