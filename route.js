import express from "express";
import { createWinner, drawLottery } from "./firebase-admin.js";
import { lotteryTime } from "./constants.js";
const router = express.Router();

router.get("/cron", async (req, res) => {
  try {
    const data = await createWinner({
      number: "99",
      created_at: Date.now(),
      users: [],
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
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
