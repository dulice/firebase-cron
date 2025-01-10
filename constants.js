export const lotteryTime = () => {
  const today = new Date();
  const previousLotteryDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    0,
    12
  );

  const lotteryDate = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    12,
    0,
    0,
    0
  );

  return {
    lotteryDate: lotteryDate,
    previousLotteryDate: previousLotteryDate,
    today: today,
  };
};

export const collectionPath = {
  USERS: "users",
  BETS: "bets",
  WINNERS: "winners",
};

export const randomNumberFormat = (exclusiveNumber = []) => {
  let num;
  do {
    const randomNum = Math.floor(Math.random() * 100);
    num =
      randomNum.toString().length < 2 ? "0" + randomNum : randomNum.toString();
  } while (exclusiveNumber.includes(num));
  return num;
};
