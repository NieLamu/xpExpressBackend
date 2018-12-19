'use strict';(function (win) {


  var client, host, port, clientId, reconnectTimeout, cleanSession, topic, mySub;


  function startMQTT(subId, opt) {
    host = opt.host;
    port = opt.port;
    clientId = opt.clientId;

    reconnectTimeout = opt.reconnectTimeout;
    cleanSession = opt.cleanSession;

    opt.topic = opt.topic || "/mqtt";
    topic = opt.topic;
    mySub = opt.topic + '/' + subId + '/#';
    MQTTconnect();


  }


  function MQTTconnect() {
      client = new Paho.Client(
          host,//MQTT 域名
          port,//WebSocket 端口，如果使用 HTTPS 加密则配置为443,否则配置80
          topic,
          clientId//客户端 ClientId
      );
      const options = {
          timeout: 3,
          onSuccess: onConnect,
          cleanSession: cleanSession,
          onFailure: function (message) {
              setTimeout(MQTTconnect, reconnectTimeout);
          }
      };
      client.onConnectionLost = onConnectionLost;
      client.onMessageArrived = onMessageArrived;
      client.connect(options);
  }


  function onConnect() {
    console.log('——————>onConnect');
      // Connection succeeded; subscribe to our topic
      client.subscribe(mySub, {qos: 1,
          onSuccess:function (x) {
              console.log('——————>onConnect subscribe onSuccess, sub from', mySub)
          },
          onFailure:function (x) {
              console.log('——————>onConnect subscribe onFailure', x);
          }
      });
  }


  function onConnectionLost(response) {
      console.log('——————>onConnectionLost', response);
      setTimeout(MQTTconnect, reconnectTimeout);
  };


  function onMessageArrived(message) {
      console.log('——————>onMessageArrived', message);
  };




  /** 发送消息 **/
  function MQTTsendmsg(message, path) {
    console.log('message', message);
    if(typeof message==='object') message = JSON.stringify(message);
    else message = String(message);
    console.log('message', message)

    var msg = new Paho.Message(message);//set body
    msg.destinationName = topic  + '/' + path;// set topic
    msg.qos = 1;// set topic
    client.send(msg);
    console.log('——————>MQTTsendmesg: to—>', msg.destinationName, ' said—>', message);
  };


  function unSubscribe() {
    console.log('——————>unSubscribe');
    client.unsubscribe(mySub);
  }


  function disConnect() {
    console.log('——————>disconnect');
    client.disconnect();
  }



  win.ourMQ = {
    startMQTT : startMQTT,
    MQTTsendmsg: MQTTsendmsg,
    unSubscribe: unSubscribe,
    disConnect: disConnect
  };



})(window,document);
