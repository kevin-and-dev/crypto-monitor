const { CURRENCY } = require("./lib/Bitstamp/lib");

console.log( "Pair: " + process.env.PAIR );
const bitstampGrabber = require('./bitstamp-dataGrabber');
new bitstampGrabber( process.env.PAIR || CURRENCY.BTC_EUR ).startGrabber();



// Fool the Google Cloud Port Ping
if ( process.env.gcloudRun ) {
  console.log("Starting Dummy Port Listener for gCloud Run");
  let http = require('http');
  http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('OK!');
  }).listen(8080); 
}
