/* eslint-disable */

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
const serviceAccount = require('../../../resources/crypto-monitor-54b8b-firebase-adminsdk-jt8ae-172d79e69a.json');
admin.initializeApp(
  { credential: admin.credential.cert(serviceAccount) }
);
const fsdb = admin.firestore();


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Firebase - Firestore Function ~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
async function saveDataIntoFirebase(data, channel, pair) {

  // if (logCounter < 20) {
  //   logCounter++;
  //   console.log(this.logCounter + ") " + pair +": "+ data.id);
  // }

  await fsdb.collection("exchange").doc("Bitstamp").collection(channel).doc(pair).collection("raw").add({
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
