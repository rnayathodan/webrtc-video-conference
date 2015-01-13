var express=require("express");
var http=require("http");
var app=express();
var server=http.createServer(app);
app.set("port", (process.env.PORT || 5000));
app.use(express.static(__dirname + "/public"));

server.listen(app.get("port"), function() {
  console.log("Node app is running at localhost:" + app.get("port"));
});

// npm install reliable-signaler
require('reliable-signaler')(server);
