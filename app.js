require("dotenv").config()
const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)
const cron = require('node-cron')
const axios = require('axios')
const url = "https://api-dev.zeetip.com/api/calls?status=En%20attente&freeCall=1"

cron.schedule('* * * * * *', () => {
  getCalls()
})

const getCalls = () => {
  axios(url)
  .then(data => {
    if(data.data['hydra:member'].length !== 0) {
    loopThroughCalls(data.data['hydra:member'])
    }
  })
  .catch(err => console.log(err))
}

const endCalls = (callsid) => {
  client.calls(callsid).update({status: 'completed'})
}

const loopThroughCalls = (calls) => {
  while(calls.length !== 0) {
    for(let call of calls) {
      const proFreeTime = call.proFreeMinutesNumber * 60
      const newDate = new Date(call.date)
      if(dateDiff(newDate) >= proFreeTime) {
      console.log(dateDiff(newDate))
      console.log(call.twilioCallSid)
      endCalls(call.twilioCallSid)
      }
    }
    calls.length = 0
  }
}

const dateDiff = (date) => {
  const currentDate = new Date()
  return (currentDate.getTime() - date.getTime()) / 1000;
}

