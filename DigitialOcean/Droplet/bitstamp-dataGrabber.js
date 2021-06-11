"use strict";

/* Bitstamp Streams */
// @ https://www.bitstamp.net/websocket/v2/
const { BitstampStream, CURRENCY } = require("./lib/Bitstamp/lib");
const bitstampStream = new BitstampStream();

// require('./lib/firebase/firestore/firestore');
// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
const serviceAccount = require('./resources/crypto-monitor-54b8b-firebase-adminsdk-jt8ae-172d79e69a.json');
admin.initializeApp(
  { credential: admin.credential.cert(serviceAccount) }
);
// const fsdb = admin.firestore();


class dataGrabber {

  constructor(currencyPair = CURRENCY.BTC_USD) {
    this.logCounter = 0;
    this.fsdb = admin.firestore();
    this.inputPair = currencyPair;
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Firebase - Firestore Function ~~~~~~~~~~~~~~~~
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  async saveDataIntoFirebase(data, channel, pair) {

    if (this.logCounter < 20) {
      this.logCounter++;
      console.log(this.logCounter + ") " + pair +": "+ data.id);
    }

    await this.fsdb.collection("exchange").doc("Bitstamp").collection(channel).doc(pair).collection("raw").add({
      tradeid: data.id,
      mtimestamp: (data.microtimestamp / 1000),
      price: data.price,
      amount: data.amount,
      type: data.type,
      cost: data.cost,
    })
    // .then((docRef) => { this.debugMode && console.log("Saved into Firebase as " + docRef.id); })
    .catch((error) => { console.error("Firestore Error:\n" + error) });
  }


  startGrabber() {

    // Execution Config
    const runningCfg = {
      "pair": this.inputPair,
      "channel": bitstampStream.CHANNEL_LIVE_TRADES
    }

    // Start
    bitstampStream.on("connected", () => {

      if (this.tickerChannel) {
        this.tickerChannel.reconnect();
      } else {
        this.tickerChannel = bitstampStream.subscribe(runningCfg.channel, runningCfg.pair);
        bitstampStream.on(this.tickerChannel, ({ data, }) => {
          this.saveDataIntoFirebase(data, runningCfg.channel, runningCfg.pair);
        });
      }

    });

    if (!this.tickerChannel) {
      bitstampStream.on("disconnected", () => { console.warn("Disconnected"); this.startGrabber(); });
      bitstampStream.on("error", (e) => { console.error(e); this.startGrabber() });
    }

  }

  stopGrabber() {
    bitstampStream.unsubscribeAll();
  }
}
module.exports = dataGrabber;
