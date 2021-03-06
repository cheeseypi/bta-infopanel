var x = new WebSocket('ws://' + location.host);
var state = {};
x.addEventListener('open', function (event) {
    console.log("Opened Socket");
});
x.addEventListener('message', function (event) {
    console.debug("Message Recieved:", event);
    let message = JSON.parse(event.data);
    if (message.type === 'state') {
        updateState(message);
    }
    if (message.type === 'system') {
        console.log("Recieved System Event: ", message.content)
    }
});

function updateState(newState) {
    if (state.players != newState.players) {
        let nodes = [];
        let idx = 0;
        newState.players.forEach(player => {
            if (idx !== newState.loser) {
                let div = document.createElement('div');
                let playerdiv = document.createElement('div');
                playerdiv.className = "playername";
                let span = document.createElement('span');
                span.innerText = player;
                playerdiv.appendChild(span);
                let pointTally = document.createElement('span')
                pointTally.id = `tally_${player}`;
                pointTally.style.fontWeight = "bolder";
                if (newState.points && newState.points[player]) {
                    pointTally.innerText = ` ${newState.points[player]}`;
                }
                else {
                    pointTally.innerText = " 0";
                }
                playerdiv.appendChild(pointTally)
                div.appendChild(playerdiv);
                let minusButton = document.createElement('button');
                minusButton.type = 'button';
                minusButton.innerText = '-🍓';
                minusButton.value = player;
                minusButton.onclick = () => removePoint(player);
                div.appendChild(minusButton);
                let plusButton = document.createElement('button');
                plusButton.type = 'button';
                plusButton.innerText = '+🍓';
                plusButton.value = player;
                plusButton.onclick = () => addPoint(player);
                div.appendChild(plusButton);
                let minusRdmButton = document.createElement('button');
                minusRdmButton.type = 'button';
                minusRdmButton.innerText = '+🐦';
                minusRdmButton.value = player;
                minusRdmButton.onclick = () => removeRedeem(player);
                div.appendChild(minusRdmButton);
                let plusRdmButton = document.createElement('button');
                plusRdmButton.type = 'button';
                plusRdmButton.innerText = '+🐦';
                plusRdmButton.value = player;
                plusRdmButton.onclick = () => addRedeem(player);
                div.appendChild(plusRdmButton);
                let loseButton = document.createElement('button');
                loseButton.type = 'button';
                loseButton.innerText = 'Lost';
                loseButton.value = idx;
                loseButton.onclick = () => markLoss(loseButton.value);
                let removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.innerText = '🗑️';
                removeButton.value = idx;
                removeButton.onclick = () => removePlayer(removeButton.value);
                div.appendChild(loseButton);
                div.appendChild(removeButton);
                nodes.push(div)
            }
            idx++;
        });
        let playerNode = document.getElementById('players');
        playerNode.innerHTML = '';
        nodes.forEach(node => playerNode.appendChild(node));
    }
    //if (state.points != newState.points) {
    //    newState.points.forEach((player, total) => {
    //        let tally = document.getElementById(`tally_${player}`)
    //        if(tally){
    //            tally.innerText = `${total}`
    //        }
    //    })
    //}
    let loser = document.getElementById('loser')
    loser.innerHTML = "";
    if (newState.loser >= 0 && newState.players.length > newState.loser) {
        let div = document.createElement('div');
        let p = document.createElement('p');
        p.innerText = newState.players[newState.loser];
        p.className = "losername"
        div.appendChild(p);
        if (newState.players[newState.loser] !== 'PRELIMS' && newState.players[newState.loser] !== 'FINALS') {
            let pointTally = document.createElement('span')
            pointTally.id = `tally_${newState.players[newState.loser]}`;
            pointTally.style.fontWeight = "bolder";
            if (newState.points && newState.points[newState.players[newState.loser]]) {
                pointTally.innerText = ` ${newState.points[newState.players[newState.loser]]}`;
            }
            else {
                pointTally.innerText = " 0";
            }
            div.appendChild(pointTally)
            let minusButton = document.createElement('button');
            minusButton.className = "loserbutton";
            minusButton.type = 'button';
            minusButton.innerText = '-🍓';
            minusButton.value = newState.players[newState.loser];
            minusButton.onclick = () => removePoint(newState.players[newState.loser]);
            div.appendChild(minusButton);
            let plusButton = document.createElement('button');
            plusButton.className = "loserbutton";
            plusButton.type = 'button';
            plusButton.innerText = '+🍓';
            plusButton.value = newState.players[newState.loser];
            plusButton.onclick = () => addPoint(newState.players[newState.loser]);
            div.appendChild(plusButton);
            let minusRdmButton = document.createElement('button');
            minusRdmButton.className = "loserbutton";
            minusRdmButton.type = 'button';
            minusRdmButton.innerText = '+🐦';
            minusRdmButton.value = newState.players[newState.loser];
            minusRdmButton.onclick = () => removeRedeem(newState.players[newState.loser]);
            div.appendChild(minusRdmButton);
            let plusRdmButton = document.createElement('button');
            plusRdmButton.className = "loserbutton";
            plusRdmButton.type = 'button';
            plusRdmButton.innerText = '+🐦';
            plusRdmButton.value = newState.players[newState.loser];
            plusRdmButton.onclick = () => addRedeem(newState.players[newState.loser]);
            div.appendChild(plusRdmButton);
        }
        let unloseButton = document.createElement('button');
        unloseButton.className = "loserbutton";
        unloseButton.type = 'button';
        unloseButton.innerText = 'Unlose';
        unloseButton.onclick = () => markLoss(-1);
        let removeButton = document.createElement('button');
        removeButton.className = "loserbutton";
        removeButton.type = 'button';
        removeButton.innerText = '🗑️';
        removeButton.value = newState.loser;
        removeButton.onclick = () => removeLast(removeButton.value);
        div.appendChild(unloseButton);
        div.appendChild(removeButton);
        loser.appendChild(div);
    }
    //if (state.objective != newState.objective && newState.objective) {
    //    let div = document.getElementById('currentObjective');
    //    div.innerHTML = "";
    //    let h = document.createElement('h3');
    //    h.innerText = newState.objective.title;
    //    div.appendChild(h)
    //    let chapter = document.createElement('p')
    //    chapter.innerText = newState.objective.chosenChapter + newState.objective.sides[newState.objective.chosenChapter].join('');
    //    div.appendChild(chapter);
    //}
    //else if (!newState.objective) {
    //    let div = document.getElementById('currentObjective');
    //    div.innerHTML = "";
    //}
    Object.entries(newState.levels).forEach(([levelname, sides]) => {
        Object.entries(sides).forEach(([sidename, value]) => {
            if ((!state.levels) || (!state.levels[levelname]) || (!state.levels[levelname][sidename]) || value !== state.levels[levelname][sidename]) {
                let el = document.getElementById(levelname + sidename);
                if (el) {
                    if (value) {
                        el.style.backgroundColor = "lightgreen";
                    }
                    else {
                        el.style.backgroundColor = "coral";
                    }
                }
            }
        })
    })
    state = newState;
}

function sendUpdateHeart(heart) {
    x.send(JSON.stringify({ type: "updateHeart", content: heart }))
}

function addPlayer() {
    let adder = document.getElementById('playeradder');
    if (adder.value) {
        x.send(JSON.stringify({ type: "addPlayer", content: adder.value }))
        adder.value = '';
    }
}

function removeLast(index) {
    x.send(JSON.stringify({ type: "removePlayer", content: index }));
    x.send(JSON.stringify({ type: "losePlayer", content: -1 }));
}

function removePlayer(index) {
    x.send(JSON.stringify({ type: "removePlayer", content: index }));
}

function markLoss(index) {
    x.send(JSON.stringify({ type: "losePlayer", content: index }));
}

function triggerPrelims() {
    x.send(JSON.stringify({ type: "triggerPrelims" }));
}
function triggerFinals() {
    x.send(JSON.stringify({ type: "triggerFinals" }));
}

function triggerObjective() {
    let chSel = document.getElementById('chapter');
    if (chSel.value) {
        x.send(JSON.stringify({ type: "triggerObjective", content: chSel.value }))
    }
}
function clearObjective() {
    x.send(JSON.stringify({ type: "clearObjective" }));
}

function addPoint(player) {
    x.send(JSON.stringify({ type: "addPoint", content: player }))
}
function removePoint(player) {
    x.send(JSON.stringify({ type: "removePoint", content: player }))
}
function addRedeem(player) {
    x.send(JSON.stringify({ type: "addRedeem", content: player }))
}
function removeRedeem(player) {
    x.send(JSON.stringify({ type: "removeRedeem", content: player }))
}

function triggerLevelToggle(id) {
    x.send(JSON.stringify({ type: "toggleLevel", content: id }))
}

function sendStartTimer() {
    x.send(JSON.stringify({ type: "startTimer" }));
}
function sendPauseTimer() {
    x.send(JSON.stringify({ type: "pauseTimer" }));
}