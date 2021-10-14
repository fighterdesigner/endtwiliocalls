require("dotenv").config();
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const url = process.env.URL;
const client = require("twilio")(accountSid, authToken);
const cron = require("node-cron");
const axios = require("axios");

cron.schedule("*/10 * * * * * *", () => {
  getCalls();
});

const getCalls = () => {
  axios(url)
    .then(data => {
      loopThroughCalls(data.data["hydra:member"]);
    })
    .catch(err => console.log(err));
};

const endCalls = (callsid, consumedFreeTime) => {
  //client.calls(callsid).update({ status: "completed" });
  client.calls(callsid).update({ twiml: "<Response><Hangup/></Response>" });

  //TODO : Mettre a jour le statut de label sur la base de donnees 'termine'
};

const loopThroughCalls = (calls) => {
  console.log(
    `${calls.length} calls en attente with freeCall found ${new Date()}`
  );
  for (let call of calls) {
    const proFreeTime = call.proFreeMinutesNumber * 60;
    const newDate = new Date(call.date);
    const diff = dateDiff(newDate);
    if (diff >= proFreeTime) {
      console.log(
        `Cons/Free : ${diff}/${proFreeTime} sec, Call at : ${newDate}, Call Sid : ${call.twilioCallSid}`
      );
      endCalls(call.twilioCallSid, diff);
    }
  }
};

const dateDiff = (date) => {
  const currentDate = new Date();
  return (currentDate.getTime() - date.getTime()) / 1000;
};
