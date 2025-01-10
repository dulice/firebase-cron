import dotenv from "dotenv";
dotenv.config();

import express from "express";
import corn from "node-cron";
import cors from "cors";
import { drawLottery } from "./firebase-admin.js";
import { lotteryTime } from "./constants.js";

const app = express();
app.use(cors());
app.use(express.json());

corn.schedule("0 12 28-31 * *", async () => {
  const { lotteryDate, today } = lotteryTime();
  if (lotteryDate.toLocaleString() === today.toLocaleString()) {
    console.log("running on serverless");
    await drawLottery();
    console.log("running on schedule");
  } else {
    console.log("Today is not the last day of the month. Skipping...");
  }
});

corn.schedule("* * * * *", () => {
  console.log("running every minute");
});

app.use("*", (req, res) => {
  res.send("hello");
});

app.listen(process.env.PORT, () => {
  console.log("server is running on " + process.env.PORT);
});
