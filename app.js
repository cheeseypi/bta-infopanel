const express = require('express');
const ws = require('ws');

const port = 8080;

const app = express();
const wsServer = new ws.Server({noServer: true});

const messageTypes = {
    system: "system",
    updateHeart: "updateHeart",
    addPlayer: "addPlayer",
    removePlayer: "removePlayer",
    losePlayer: "losePlayer",
    refresh: "refresh"
}

var state = {
    type: 'state',
    currentHeart: 'blue',
    players: [],
    loser: -1
};

var clients = [];

wsServer.on('connection', socket => {
    socket.send(JSON.stringify({type: messageTypes.system, content:'Acknowledge Connection'}));
    socket.send(JSON.stringify(state));
    clients.push(socket);
    socket.on('message', (event) => {
        console.debug("Message Recieved:", event.toString());
        let data = JSON.parse(event.toString());
        if(data.type === messageTypes.updateHeart){
            state.currentHeart = data.content;
        }
        else if(data.type === messageTypes.addPlayer){
            state.players.push(data.content);
            state.players.sort();
        }
        else if(data.type === messageTypes.removePlayer){
            state.players.splice(data.content, 1);
            if(state.loser === data.content)
                state.loser = -1;
            if(state.loser > data.content)
                state.loser -= 1;
        }
        else if(data.type === messageTypes.losePlayer){
            state.loser = parseInt(data.content);
        }
        broadcast(state);
    });
});

//Send a message to all clients
function broadcast(message) {
    let forRemoval = [];
    clients.forEach(client => {
        if(client.readyState === ws.OPEN){
            client.send(JSON.stringify(message))
        }
        else if(client.readyState === ws.CLOSED || client.readyState === ws.CLOSING){
            forRemoval.push(client);
            console.log('Removing a client');
        }
    });
    clients = clients.filter(item => forRemoval.indexOf(item) === -1);
}

//Debug messages
//setInterval(() => {broadcast({type: messageTypes.updateHeart, content: 'rainbow'})}, 5000);
//setInterval(() => {broadcast({type: messageTypes.updateHeart, content: 'blue'})}, 6000);
//setInterval(() => {broadcast({type: messageTypes.updateHeart, content: 'sdfs'})}, 7000);

//Serve clients
app.use('/', express.static('Clients'));

//Start Server
const server = app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);
});
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
})