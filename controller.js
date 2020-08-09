const defaultScript = `module.setup = () => {}

module.draw = () => {
    context.fillStyle = "red";
    const t = performance.now();

    const x = 10;
    const y = t % canvas.height;

    const w = canvas.width - 20;
    const h = 5;

    context.fillRect(x, y, w, h);
}`;

function newElement(type, name, callback) {
    const btn = document.createElement(type);
    btn.innerHTML = name;
    btn.onclick = callback;
    document.body.appendChild(btn);
    return btn;
}

function initPresentation() {
    let connection;

    const presentBtn = newElement('button', "Present", () => {
        request.start().then(setConnection);
    });
    const stopBtn = newElement('button', "Stop", () => {
        connection && connection.terminate();
    });

    const request = new PresentationRequest(["/canvas.html"]);

    const handleAvailabilityChange = available => {
        presentBtn.style.display = available ? "inline" : "none";
    }

    request.getAvailability().then(availability => {
        handleAvailabilityChange(availability.value);
        availability.onchange = function () {
            handleAvailabilityChange(this.value);
        };
    }).catch(function () {
        handleAvailabilityChange(true);
    })

    function setConnection(newConnection) {
        if (connection && connection != newConnection && connection.state != 'closed') {
            connection.close();
        }

        connection = newConnection;

        const textArea = newElement('textarea', '');
        textArea.value = defaultScript;

        const pushButton = newElement('button', 'Run Script', () => {
            const text = textArea.value;
            pushScript(text);
        });

        function pushScript(scriptString) {
            sendMessage({ type: "script", script: scriptString });
        }

        function sendMessage(json) {
            connection.send(JSON.stringify(json));
        }
        
        function handleMessage(message) {
            console.log(`Received message: ${message.data}`);
        }

        connection.onconnect = _ => {
            connection.onmessage = message => {
                handleMessage(JSON.parse(message.data));
            };
            setTimeout(() => {
                sendMessage({ string: "Test" });
            }, 100);
            setTimeout(() => {
                sendMessage({ string: "Tes2t" });
            }, 1000);
        };
    }
}

initPresentation();
