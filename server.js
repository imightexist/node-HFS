const express = require('express');
const path = require('path');
const fs = require('fs');
//const Blob = require("buffer").Blob;
const WebSocket = require('ws').WebSocketServer;
const mime = require('mime');
const httpServer = require('http').createServer();
const password = require('./config.json');
const port = password.port;
const ws = new WebSocket({
    server: httpServer
});
const app = express();
ws.on('connection', function (f) {
    f.send(JSON.stringify(['usepassword', password.usepassword]));
    loggedin = !password.usepassword;
    f.on('message', function (msg) {
        array = new Uint8Array(msg);
        let message = "";
        //console.log(array[0]);
        array.forEach(function (h) {
            let char = String.fromCharCode(h);
            message += char
        });
        try {
            message = JSON.parse(message);
        } catch (e) {
            return console.log('not json: ' + message);
        }

        console.log(message);
        if (message[0] == 'login') {
            if (password.usepassword == false) {
                f.send(JSON.stringify(['login', false]));
            } else {
                if (password.password == message[1]) {
                    f.send(JSON.stringify(['login', true, true]));
                    loggedin = true;
                } else {
                    f.send(JSON.stringify(['login', true, false]));
                }
            }
        }
        if (message[0] == 'upload') {
            if (loggedin) {
                filename = message[2];
                filepath = __dirname + '/files' + filename;
                var regex = /^data:.+\/(.+);base64,(.*)$/;

                var matches = message[1].match(regex);
                var ext = matches[1];
                var data = matches[2];
                var buffer = Buffer.from(data, 'base64');
                //fs.writeFile(filepath, message[1].toString(), function () { });
                //fs.writeFile(filepath, 'data.' + ext, function(){});
                fs.writeFileSync(filepath, buffer);
            }

        }
        if (message[0] == 'mkdir') {
            //fs.mkdirSync(message[1]);
            if (loggedin && password.allowfolders) {
                fs.mkdir('files/' + message[1].toString(), function () { console.log('Created folder: ' + message[1].toString()); });
            }
        }
        if (message[0] == 'logout') {
            loggedin = false;
        }
        if (message[0] == 'dir') {
            //f.send(JSON.stringify(['dir',fs.readdirSync('files' + message[1])]));
            e = fs.readdirSync('files' + message[1]);
            e.forEach(function (file) {
                if (fs.lstatSync('files' + message[1] + '/' + file).isDirectory()) {
                    f.send(JSON.stringify(['addfolder', file]));
                } else {
                    f.send(JSON.stringify(['addfile', file]));
                }
            })
        }
        if (message[0] == 'readfile') {
            file = fs.readFileSync('files' + message[1],{encoding:"base64"});
            /*
            
            //console.log(file);
            array = new Uint8Array(file);
            let newFile = "";
            //console.log(array[0]);
            array.forEach(function (h) {
                let char = String.fromCharCode(h);
                newFile += char
            });
            //f.send(JSON.stringify(['download', URL.createObjectURL(file)]));
            f.send(JSON.stringify(['download', URL.createObjectURL(new Blob([Buffer.from(file)]))]));
            */
            /*
            function base64_encode(file) {
                // read binary data
                var bitmap = fs.readFileSync(file);
                // convert binary data to base64 encoded string
                return new Buffer(bitmap).toString('base64');
            }
            */
            f.send(JSON.stringify(['download','data:'+ mime.getType('files' + message[1]) + ';base64,' + file,path.parse('files' + message[1]).base]));
        }
        //console.log(message);
    })
});
/*
//not websocket?? useless!!!
app.get('/files',function(req,res){
    dir = [];
    fs.readdir(__dirname + '/files', function (err, files) {
        //handling error
        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            dir.push(file);
            console.log(file);
        });
        res.send(dir);
    });
    
})
app.post('/files',function(req,res){
    console.log('yay');
    filename = req.files.upload.name;
    filepath = __dirname + '/files/' + filename;
    req.pipe(fs.createWriteStream(filepath,{flags:"a"}))
})
*/
app.use('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
httpServer.on('request', app);
//app.listen(webserverPort);
httpServer.listen(port.toString());