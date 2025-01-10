import dotenv from "dotenv";
dotenv.config();
import firebase_admin from "firebase-admin";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import {
  collectionPath,
  lotteryTime,
  randomNumberFormat,
} from "./constants.js";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const firebase = firebase_admin.initializeApp({
  credential: firebase_admin.credential.cert(serviceAccount),
});
export const db = getFirestore(firebase);

export const getlastWinner = async () => {
  try {
    let data = [];
    const docRef = db.collection(collectionPath.WINNERS);
    const docSnap = await docRef.orderBy("created_at", "desc").limit(2).get();

    for (let doc of docSnap.docs) {
      const winnerData = doc.data();
      data.push({ ...winnerData, id: doc.id });
    }
    return data;
  } catch (error) {
    console.error("Error getting document:", error);
  }
};

export const generateWinners = async (number) => {
  try {
    const docRef = db.collection(collectionPath.BETS);
    const docSnap = await docRef
      .where("created_at", ">=", lotteryTime().previousLotteryDate)
      .where("created_at", "<", lotteryTime().lotteryDate)
      // .where("payment", "==", "success")
      .get();

    if (docSnap.empty) return [];

    const updateWinners = docSnap.docs.map(async (snap) => {
      const betData = snap.data();
      const betRef = db.collection(collectionPath.BETS).doc(snap.id);
      const status = betData.bet_number === number ? "win" : "lose";
      await betRef.update({ status });
    });
    await Promise.all(updateWinners);

    const updatedDocSnap = await docRef
      .where("created_at", ">=", lotteryTime().previousLotteryDate)
      .where("created_at", "<", lotteryTime().lotteryDate)
      .get();

    return updatedDocSnap.docs
      .filter((doc) => doc.data().status === "win")
      .map((doc) => doc.data().user);
  } catch (error) {
    console.log(error);
  }
};

const updateWinner = async (data, id) => {
  const winnerRef = db.collection(collectionPath.WINNERS).doc(id);
  await winnerRef.update(data);
};

export const createWinner = async (data) => {
  try {
    const winnerRef = db.collection(collectionPath.WINNERS);
    const docRef = await winnerRef.add(data);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document:", error);
  }
};

export const drawLottery = async () => {
  const { lotteryDate } = lotteryTime();
  const winner = await getlastWinner();
  if (winner) {
    if (
      winner[0].created_at.toDate().toLocaleString() ===
      lotteryDate.toLocaleString()
    ) {
      const winners = await generateWinners(winner[0].number);
      console.log("update");
      await updateWinner({ users: winners }, winner[0].id);
      // winners?.forEach(async (winnerId) => {
      //   const user = await getUser(winnerId);
      //   await sendNotification(user!, winner[0].number);
      // });
    } else {
      console.log("create");
      const winningNumber = randomNumberFormat();
      const winners = await generateWinners(winningNumber);
      await createWinner({
        users: winners,
        number: winningNumber,
        created_at: Timestamp.fromDate(lotteryDate),
      });
      // winners?.forEach(async (winnerId) => {
      //   const user = await getUser(winnerId);
      //   await sendNotification(user, winner[0].number);
      // });
    }
  }
};
