var state = {}
var x = new WebSocket('ws://'+location.host);
x.addEventListener('open', function (event) {
    console.log("Opened Socket");
});
x.addEventListener('message', function (event) {
    console.debug("Message Recieved:", event);
    let message = JSON.parse(event.data);
    if(message.type === 'state'){
        updateState(message);
    }
    else if(message.type === 'system'){
        console.log("Recieved System Event: ", message.content)
    }
});

function updateState(newState){
    if(state.players != newState.players || state.points != newState.points){
        let nodes = [];
        let idx = 0
        newState.players.forEach(player => {
            if(idx !== newState.loser){
                let p = document.createElement('p');
                p.innerText = player;
                if(newState.points[player] && newState.points[player] > 0)
                    p.innerText += ` (+${newState.points[player] * 5})`
                if(newState.points[player] && newState.points[player] < 0)
                    p.innerText += ` (${newState.points[player] * 5})`
                nodes.push(p)
            }
            idx++;
        });
        let playerNode = document.getElementById('players');
        playerNode.innerHTML = '';
        nodes.forEach(node => playerNode.appendChild(node));
    }
    state = newState;
}