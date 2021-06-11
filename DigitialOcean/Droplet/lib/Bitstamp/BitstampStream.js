"use strict";

const WebSocket = require("ws");
const ReconnectingWebSocket = require("reconnecting-websocket");
const EventEmitter = require("events");

class BitstampStream extends EventEmitter {

  constructor(url = "wss://ws.bitstamp.net") {
    super();
    this.url = url;

    this.EVENT_UNSUBSCRIPTION_SUCCEEDED = "bts:unsubscription_succeeded";  
    this.EVENT_SUBSCRIPTION_SUCCEEDED = "bts:subscription_succeeded";      
    this.EVENT_REQUEST_RECONNECT = "bts:request_reconnect";                
  
    this.CHANNEL_LIVE_TRADES = "live_trades";                              
    this.CHANNEL_LIVE_ORDERS = "live_orders";                              
    this.CHANNEL_ORDER_BOOK = "order_book";                                
    this.CHANNEL_DETAIL_ORDER_BOOK = "detail_order_book";                  
    this.CHANNEL_DIFF_ORDER_BOOK = "diff_order_book";                      
  

    this.connect();
    this.ws.addEventListener("open", () => {
      super.emit("connected");
    });
    this.ws.addEventListener("close", () => {
      super.emit("disconnected");
    });
    this.ws.addEventListener("message", this._onMessageHandler.bind(this));
  }

  subscribe(channelBase, currencyPair) {
    this.currencyPair = currencyPair;
    const channel = `${channelBase}_${currencyPair}`;
    this._send("bts:subscribe", { channel });
    return channel;
  }

  unsubscribe(channelBase, currencyPair) {
    const channel = `${channelBase}_${currencyPair}`;
    this._send("bts:unsubscribe", { channel });
  }

  unsubscribeAll() {
    for (const channel of this.subscriptions) {
      this._send("bts:unsubscribe", { channel });
    }
  }

  connect() {
    const options = {
      WebSocket, // custom WebSocket constructor
      connectionTimeout: 1000,
      maxRetries: 10,
    };
    this.ws = new ReconnectingWebSocket(this.url, [], options);
    this.subscriptions = new Set();
  }

  reconnect() {
    console.warn("BitstampStream Reconnecting: " + this.currencyPair);
    // this.close();
    this.connect();
  }

  _send(event, data) {
    this.ws.send(JSON.stringify({ event, data }));
  }

  _onMessageHandler(messageEvent) {
    if (messageEvent.data) {
      let msg;
      try {
        msg = JSON.parse(messageEvent.data);
      } catch (e) {
        super.emit('error', e);
        return;
      }
      let { data, event, channel } = msg;

      if (event === this.EVENT_UNSUBSCRIPTION_SUCCEEDED) {
        console.log('Message Handler: Unsubscription Succeeded ' + channel);
        this.subscriptions.delete(channel);
      } else if (event === this.EVENT_SUBSCRIPTION_SUCCEEDED) {
        console.log('Message Handler: Subscription Succeeded ' + channel);
        this.subscriptions.add(channel);
      } else if (event === this.EVENT_REQUEST_RECONNECT) {
        console.log('Message Handler: Req Reconnect ' + channel);
        // this.reconnect();
      } else {
        
        // if (channel.startsWith(this.CHANNEL_LIVE_TRADES) || channel.startsWith(this.CHANNEL_LIVE_ORDERS)) {
        if (channel.startsWith(this.CHANNEL_LIVE_TRADES)) {
          data = { ...data, cost: data.amount * data.price };
        } else {
          console.log("Channel: " + channel + " Event: " + event);
        }
        super.emit(channel, { data, event });
      }
    }
  }

  close() {
    if (this.ws) {
      this.unsubscribeAll();
      return this.ws.close();
    }
  }
}

module.exports = BitstampStream;
