# node-HFS
a nodejs hfs server
## npm packages to install
Type this in the terminal before running: `npm install express path ws mime`
## Warning
if you need to, change the password in .env instead of config.json and change the code as well.
## interacting with the server on nodejs
you have to download using websocket, not sorry.
```javascript
const websocketClient = require('websocket').client;
const ws = new websocketClient();
const fs = require('fs')
ws.on('connection',function(f){
  f.sendUTF(JSON.stringify(['readfile','test.txt']));
  f.on('message',function(msg){
    message = JSON.parse(msg);
    if (message[0] == "download"){
      var regex = /^data:.+\/(.+);base64,(.*)$/;

      var matches = message[1].match(regex);
      var ext = matches[1];
      var data = matches[2];
      var buffer = Buffer.from(data, 'base64');
      fs.writeFileSync(message[2], buffer);
    }
  }
}
ws.connect("wss://hfs.astroistaken.repl.co");
```
## Demo
https://hfs.astroistaken.repl.co

You can only upload 1 mb files
