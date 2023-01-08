import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./src/routes/assessment.route.js";
import dbo from "./src/mongo/connection.js";

const app = express();
const APP_PORT = 5000;
app.use(cors({ origin: true }));
app.use(express.urlencoded());
app.use(express.json());

app.use("/", router);

app.listen(APP_PORT, () => {
  // perform a database connection when server starts
  dbo.connectToServer().catch((err) => {
    console.error(err);
  });
  console.log(`api listening at http://localhost:${APP_PORT}`);
});
