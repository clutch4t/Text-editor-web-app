let fs = require("fs");
let http = require('http');
let express = require('express');
let { Server } = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = new Server(server);
app.use(express.static(__dirname + "/public"));
import "./style.scss";

io.on("connection", function (socket) {
    socket.on("signup", function (data) {
        fs.readFile("data.json", "utf8", (err, output) => {
            let object = JSON.parse(output);
            object[object.length] = { "username": data.username, "password": data.password, "content": [] };

            fs.writeFile("data.json", JSON.stringify(object), "utf8", () => {
                console.log("Signed up successfully");
            });
        })
    });

    socket.on("signin", function (data) {
        let grant_access = false;

        fs.readFile("data.json", "utf8", (err, output) => {
            let object = JSON.parse(output);

            for (i = 0; i < object.length; i++) {
                if (object[i].username == data.username && object[i].password == data.password) {
                    socket.emit("granted", grant_access = true);
                    console.log("Signed in successfully");
                    socket.emit("listoffiles", JSON.stringify(object[i]));
                    break;
                }
            }
        })

    })

    socket.on("replenishlist", function (cookieValue) {
        fs.readFile("data.json", "utf8", (err, data) => {
            let list = JSON.parse(data);
            for (i = 0; i < list.length; i++) {
                if (list[i].username == cookieValue) {
                    socket.emit("replenishedlist", JSON.stringify(list[i]));
                }
            }
        })
        socket.on("edit", function (value) {
            fs.readFile("data.json", "utf8", (err, data) => {
                let object = JSON.parse(data);

                for (let i = 0; i < object.length; i++) {
                    if (object[i].username == cookieValue) {
                        socket.emit("editData", { title: object[i].content[value].filename, output: object[i].content[value].text });
                        socket.on("alteredData", (receivedData) => {
                            if (object[i].content[receivedData.numberOfFile].filename == receivedData.nameOfFile) {
                                object[i].content[receivedData.numberOfFile] = { "filename": receivedData.nameOfFile, "text": receivedData.contentOfFile };
                                fs.writeFile("data.json", JSON.stringify(object), "utf8", () => {
                                    console.log("Data has been edited successfully");
                                })
                            }
                        })
                        break;
                    }
                }
            })
        })

        socket.on("delete", function (value) {
            let success = false;

            fs.readFile("data.json", "utf8", (err, data) => {
                let object = JSON.parse(data);

                for (let i = 0; i < object.length; i++) {
                    if (object[i].username == cookieValue && object[i].content[value.numberOfFile].filename == value.nameOfFile) {
                        object[i].content.splice(value.numberOfFile, 1);
                        fs.writeFile("data.json", JSON.stringify(object), "utf8", () => {
                            console.log("Data has been deleted successfully");
                            success = true;
                            socket.emit("deletionSuccess", success);
                        })
                    }
                }
            })
        })

        socket.on("savefile", function (data) {
            let success = false;

            fs.readFile("data.json", "utf8", (err, output) => {
                let object = JSON.parse(output);

                for (let i = 0; i < object.length; i++) {
                    if (object[i].username == cookieValue) {
                        object[i].content.push({ "filename": data.title, "text": data.contents });

                        fs.writeFile("data.json", JSON.stringify(object), "utf8", () => {
                            console.log("Saved successfully");
                            success = true;
                            socket.emit("creationSuccess", success);
                        })
                    }
                }
            })
        })
    })


})

server.listen(3000, function () {
    console.log("Server is located at http://localhost:3000");
})
