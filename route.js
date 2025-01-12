import express from "express";
import { drawLottery, sendNotification } from "./firebase-admin.js";
import { lotteryTime } from "./constants.js";
const router = express.Router();

router.post("/noti", async (req, res) => {
  const { pushToken, number } = req.body;
  const data = sendNotification(pushToken, number);
  return res.status(200).json(data);
});

router.get("/cron-lottery", async (req, res) => {
  try {
    const { lotteryDate, today } = lotteryTime();
    if (lotteryDate.toLocaleString() === today.toLocaleString()) {
      const data = await drawLottery();
      res.send(200).json(data);
    } else {
      res
        .status(201)
        .json("Today is not the last day of the month. Skipping...");
    }
  } catch (error) {
    res.send(500).json(error);
  }
});

export default router;
