const canvas = document.querySelector('canvas');
const context = canvas.getContext("2d");

window.addEventListener("DOMContentLoaded", e => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})

const module = {
    draw() {},
    setup() {}
}

const messagelog = [];

function log(str) {
    messagelog.push(str);
    draw();
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#fff";
    context.font = '12px Monospace';

    let index = 0;
    for(let line of messagelog) {
        context.fillText(line, 40, 40 + (index * 18));
        index++;
    }
}

function tick() {

    draw();

    try {
        module.draw();
    } catch(err) {
        console.error(err);
    }

    requestAnimationFrame(tick);
}

tick();

navigator.presentation.receiver.connectionList.then((list) => {
    const connection = [...list.connections][0];
    
    connection.onmessage = message => {
        const messageObj = JSON.parse(message.data);
        const type = messageObj.type;

        if(type == "script") {
            try {
                eval(messageObj.script);
                module.setup();
            } catch(err) {
                console.error(err);
            }
        }

        log(message.data);
    };
});
