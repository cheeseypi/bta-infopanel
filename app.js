const express = require('express');
const ws = require('ws');
const fs = require('fs');

const divisions = JSON.parse(fs.readFileSync("initial-divisions.json"));
const objectives = JSON.parse(fs.readFileSync("objectives.json"))
const port = 8080;

const app = express();
const wsServer = new ws.Server({ noServer: true });

const messageTypes = {
    system: "system",
    updateHeart: "updateHeart",
    addPlayer: "addPlayer",
    removePlayer: "removePlayer",
    losePlayer: "losePlayer",
    refresh: "refresh",
    triggerPrelims: "triggerPrelims",
    triggerFinals: "triggerFinals",
    triggerObjective: "triggerObjective",
    clearObjective: "clearObjective",
    addPoint: "addPoint",
    removePoint: "removePoint",
    addRedeem: "addRedeem",
    removeRedeem: "removeRedeem",
    toggleLevel: "toggleLevel",
    startTimer: "startTimer",
    pauseTimer: "pauseTimer"
}

const levels = {
    '1': {
        'a': true,
        'b': true,
        'c': true
    },
    '2': {
        'a': true,
        'b': true,
        'c': true
    },
    '3': {
        'a': true,
        'b': true,
        'c': true
    },
    '4': {
        'a': true,
        'b': true,
        'c': true
    },
    '5': {
        'a': true,
        'b': true,
        'c': true
    },
    '6': {
        'a': true,
        'b': true,
        'c': true
    },
    '7': {
        'a': true,
        'b': true,
        'c': true
    },
    '8': {
        'a': true,
        'b': true,
        'c': true
    },
}

var state = {
    type: 'state',
    currentHeart: 'blue',
    players: ['PRELIMS'],
    loser: 0,
    objective: null,
    points: {},
    redemptions: {},
    levels: {
        '1': {
            'a': false,
            'b': true,
            'c': true
        },
        '2': {
            'a': true,
            'b': true,
            'c': true
        },
        '3': {
            'a': true,
            'b': true,
            'c': true
        },
        '4': {
            'a': true,
            'b': true,
            'c': true
        },
        '5': {
            'a': true,
            'b': true,
            'c': true
        },
        '6': {
            'a': true,
            'b': true,
            'c': true
        },
        '7': {
            'a': true,
            'b': true,
            'c': true
        },
        '8': {
            'a': true,
            'b': true,
            'c': true
        },
    },
    timer: {
        isRunning: false,
        duration: 0,
        endTime: null
    }
};

var clients = [];

wsServer.on('connection', socket => {
    socket.send(JSON.stringify({ type: messageTypes.system, content: 'Acknowledge Connection' }));
    socket.send(JSON.stringify(state));
    clients.push(socket);
    socket.on('message', (event) => {
        console.debug("Message Recieved:", event.toString());
        let data = JSON.parse(event.toString());
        if (data.type === messageTypes.updateHeart) {
            state.currentHeart = data.content;
        }
        else if (data.type === messageTypes.addPlayer) {
            let loser = ""
            if (state.loser >= 0) {
                loser = state.players[state.loser]
            }
            state.players.push(data.content);
            state.players.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
            if (loser) {
                state.loser = state.players.indexOf(loser);
            }
            if(!state.timer.isRunning){
                state.timer.duration = state.players.filter(x => x!=="PRELIMS" && x!=="FINALS").length * 15 * 60
            }
        }
        else if (data.type === messageTypes.removePlayer) {
            state.players.splice(data.content, 1);
            delete state.points[data.content];
            delete state.redeems[data.content];
            if (state.loser === data.content)
                state.loser = -1;
            if (state.loser > data.content)
                state.loser -= 1;
            if(!state.timer.isRunning){
                state.timer.duration = state.players.filter(x => x!=="PRELIMS" && x!=="FINALS").length * 15 * 60
            }
        }
        else if (data.type === messageTypes.losePlayer) {
            state.loser = parseInt(data.content);
        }
        else if (data.type === messageTypes.triggerPrelims) {
            state.players = ['PRELIMS'];
            if (divisions[state.currentHeart]) {
                state.players = state.players.concat(divisions[state.currentHeart])
            }
            state.players.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
            state.loser = state.players.indexOf('PRELIMS');
            state.points = {}
            state.redeems = {}
            state.levels = {
                '1': {
                    'a': false,
                    'b': true,
                    'c': true
                },
                '2': {
                    'a': true,
                    'b': true,
                    'c': true
                },
                '3': {
                    'a': true,
                    'b': true,
                    'c': true
                },
                '4': {
                    'a': true,
                    'b': true,
                    'c': true
                },
                '5': {
                    'a': true,
                    'b': true,
                    'c': true
                },
                '6': {
                    'a': true,
                    'b': true,
                    'c': true
                },
                '7': {
                    'a': true,
                    'b': true,
                    'c': true
                },
                '8': {
                    'a': true,
                    'b': true,
                    'c': true
                },
            }
            state.timer.duration = state.players.filter(x => x!=="PRELIMS" && x!=="FINALS").length * 15 * 60;
            state.timer.isRunning = false;
        }
        else if (data.type === messageTypes.triggerFinals) {
            state.players.push('FINALS')
            state.players.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
            state.loser = state.players.indexOf('FINALS');
            state.timer.duration = 15 * 60;
            state.timer.isRunning = false;
        }
        else if (data.type === messageTypes.triggerObjective) {
            if (objectives[data.content] && Array.isArray(objectives[data.content])) {
                let l = objectives[data.content];
                state.objective = l[Math.floor((Math.random() * l.length))];
                state.objective['chosenChapter'] = data.content;
            }
        }
        else if (data.type === messageTypes.clearObjective) {
            state.objective = null
        }
        else if (data.type === messageTypes.addPoint) {
            if (state.points[data.content])
                state.points[data.content]++;
            else
                state.points[data.content] = 1;
        }
        else if (data.type === messageTypes.removePoint) {
            if (state.points[data.content])
                state.points[data.content]--;
            else
                state.points[data.content] = -1;
        }
        else if (data.type === messageTypes.addRedeem) {
            if (state.redeems[data.content])
                state.redeems[data.content]++;
            else
                state.redeems[data.content] = 1;
        }
        else if (data.type === messageTypes.removeRedeem) {
            if (state.redeems[data.content])
                state.redeems[data.content]--;
            else
                state.redeems[data.content] = -1;
        }
        else if (data.type === messageTypes.toggleLevel) {
            let l = data.content;
            if (typeof (l) === 'string' && l.length === 2) {
                let chapter = l[0];
                let side = l[1];
                if (state.levels[chapter] !== undefined && state.levels[chapter][side] !== undefined) {
                    state.levels[chapter][side] = !state.levels[chapter][side];
                }
            }
        }
        else if (data.type === messageTypes.startTimer){
            if(!state.timer.isRunning){
                state.timer.endTime = new Date(new Date().getTime() + state.timer.duration*1000)
                state.timer.isRunning = true
            }
            else{
                state.timer.duration = (new Date(state.timer.endTime).getTime() - new Date().getTime()) / 1000
            }
        }
        else if (data.type === messageTypes.pauseTimer){
            if(state.timer.isRunning){
                if(state.timer.endTime){
                    state.timer.duration = (new Date(state.timer.endTime).getTime() - new Date().getTime()) / 1000
                }
                state.timer.isRunning = false;
            }
        }
        broadcast(state);
    });
});

//Send a message to all clients
function broadcast(message) {
    let forRemoval = [];
    clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(message))
        }
        else if (client.readyState === ws.CLOSED || client.readyState === ws.CLOSING) {
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
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
})
