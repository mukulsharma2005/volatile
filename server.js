const express = require("express")
const path = require("path")
const { Server } = require("socket.io")
const http = require("http")
const port = 4000

const app = express()
const server = http.createServer(app); // raw HTTP server
const io = new Server(server);

const users = {}
const messages = []
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    socket.on("username", (username) => {
        users[socket.id] = username;
        io.emit("notify", username + " joined the chat.",
        )
    })
    socket.on("message", (message) => {
        messages.push({
            user: socket.id,
            message
        })
        io.emit("chat-message", {
            username: users[socket.id],
            message
        })
    })
    socket.on("disconnect",(reason)=>{
        const username = users[socket.id]
        io.emit("notify",`${username} left the chat.`)
    })

})

server.listen(port, () => {
    console.log(`Server is running at ${port}`)
})
