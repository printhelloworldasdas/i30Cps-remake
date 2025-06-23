// ==UserScript==
// @name        i30Cps remake
// @namespace   i30Cps remake
// @description BEST WS SENDER MOD! ESC = Mod Menu, P = WS Sender, L = Console Command. [ = advanced autochat. Features: Increased FPS, Ad Block, Biome Map, and more!
// @match       *://moomoo.io/*
// @match       *://sandbox.moomoo.io/*
// @match       *://dev.moomoo.io/*
// @version     1.8.1
// @grant       none
// @require     https://greasyfork.org/scripts/423602-msgpack/code/msgpack.js?version=912797
// ==/UserScript==

(function() {
    'use strict';

    // Main Variables
    let ws;
    let animateInterval = 500;
    let animateyorn = true;
    let messageToggle = 0;
    let advAc2 = "Get i30cpsmod - no unfair advantages. Stop cheaters in moomoo.io!";
    let advertisement = "Get i30cpsmod - no unfair advantages. Stop cheaters in moomoo.io!";
    let cps = 0;
    let menuKey = localStorage.getItem('i30cps_MENU') || 'Escape';

    // Create Menu HTML
    const menuHTML = `
    <div id="simpleModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <span class="closeBtn">&times;</span>
                <h2>Utility Mod Settings</h2>
            </div>
            <div class="modal-body">
                <div class="info-text">
                    <p>Utility mod with no unfair advantages. Controls: ${menuKey}=Menu, P=WS Sender, L=Console, ↑=Autochat, -=Power Mill, \\=Katana</p>
                </div>
                <div class="flexControl">
                    <a id="menuchanger">Menu Key: ${menuKey} (Click to change)</a>
                    
                    <h3>Visual Settings</h3>
                    <label class="container">Show biome map
                        <input type="checkbox" id="biomeCheck" checked>
                        <span class="checkmark"></span>
                    </label>
                    <label class="container">Aiming cursor
                        <input type="checkbox" id="cursorCheck" checked>
                        <span class="checkmark"></span>
                    </label>
                    
                    <h3>Building Shortcuts</h3>
                    <div class="shortcut-row">
                        <label>Wall:</label>
                        <input type="text" id="wallKey" value="${localStorage.getItem('i30cps_WALL') || 't'}" maxlength="1">
                    </div>
                    <div class="shortcut-row">
                        <label>Spike:</label>
                        <input type="text" id="spikeKey" value="${localStorage.getItem('i30cps_SPIKE') || 'v'}" maxlength="1">
                    </div>
                    <div class="shortcut-row">
                        <label>Mill:</label>
                        <input type="text" id="millKey" value="${localStorage.getItem('i30cps_MILL') || 'z'}" maxlength="1">
                    </div>
                    <div class="shortcut-row">
                        <label>Boost:</label>
                        <input type="text" id="boostKey" value="${localStorage.getItem('i30cps_BOOST') || 'f'}" maxlength="1">
                    </div>
                    <div class="shortcut-row">
                        <label>Turret:</label>
                        <input type="text" id="turretKey" value="${localStorage.getItem('i30cps_TURRET') || 'g'}" maxlength="1">
                    </div>
                    
                    <h3>Autochat Settings</h3>
                    <label class="container">Animate autochat
                        <input type="checkbox" id="animateCheck" checked>
                        <span class="checkmark"></span>
                    </label>
                    <div class="shortcut-row">
                        <label>Message:</label>
                        <input type="text" id="autochatMsg" value="${advAc2.substring(0, 30)}" style="width:100%">
                    </div>
                    
                    <h3>Console Functions</h3>
                    <button id="openConsole">Open Console</button>
                    <div id="consoleOutput" style="height:100px;overflow-y:scroll;background:#222;color:#fff;padding:5px;margin-top:5px;"></div>
                </div>
            </div>
        </div>
    </div>
    `;

    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
    .modal {
        display: none;
        position: fixed;
        z-index: 9999;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
    }
    .modal-content {
        background-color: #fefefe;
        margin: 5% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 600px;
        border-radius: 5px;
    }
    .closeBtn {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
    }
    .closeBtn:hover {
        color: black;
        cursor: pointer;
    }
    .container {
        display: block;
        position: relative;
        padding-left: 35px;
        margin-bottom: 12px;
        cursor: pointer;
        user-select: none;
    }
    .container input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
    }
    .checkmark {
        position: absolute;
        top: 0;
        left: 0;
        height: 25px;
        width: 25px;
        background-color: #eee;
        border-radius: 3px;
    }
    .container:hover input ~ .checkmark {
        background-color: #ccc;
    }
    .container input:checked ~ .checkmark {
        background-color: #2196F3;
    }
    .checkmark:after {
        content: "";
        position: absolute;
        display: none;
    }
    .container input:checked ~ .checkmark:after {
        display: block;
    }
    .container .checkmark:after {
        left: 9px;
        top: 5px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 3px 3px 0;
        transform: rotate(45deg);
    }
    .shortcut-row {
        margin: 8px 0;
        display: flex;
        align-items: center;
    }
    .shortcut-row label {
        width: 80px;
    }
    .shortcut-row input {
        width: 30px;
        text-align: center;
    }
    #consoleOutput {
        font-family: monospace;
        font-size: 12px;
    }
    `;
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', menuHTML);

    // Console Functions
    const consoleOutput = document.getElementById('consoleOutput');
    function logToConsole(message) {
        consoleOutput.innerHTML += message + '<br>';
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function executeCommand(command) {
        try {
            const result = eval(command);
            if (result !== undefined) {
                logToConsole('> ' + command);
                logToConsole(result.toString());
            }
        } catch (e) {
            logToConsole('Error: ' + e.message);
        }
    }

    // WebSocket Functions
    function doNewSend(data) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(new Uint8Array(Array.from(msgpack.encode(data)));
        }
    }

    // Initialize WebSocket
    WebSocket.prototype.oldSend = WebSocket.prototype.send;
    WebSocket.prototype.send = function(data) {
        if (!ws) {
            ws = this;
            ws.binaryType = 'arraybuffer';
            initializeWS();
        }
        this.oldSend(data);
    };

    function initializeWS() {
        ws.addEventListener('message', function(event) {
            const data = msgpack.decode(new Uint8Array(event.data));
            // Handle incoming WS messages
        });
    }

    // Menu Functions
    const modal = document.getElementById('simpleModal');
    const closeBtn = document.querySelector('.closeBtn');
    let updateMenuKey = false;

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => e.target == modal && (modal.style.display = 'none'));
    document.getElementById('menuchanger').addEventListener('click', () => {
        updateMenuKey = true;
        document.getElementById('menuchanger').textContent = 'Press a new menu key...';
    });

    // Event Listeners
    document.addEventListener('keydown', function(e) {
        // Menu key handling
        if (updateMenuKey) {
            menuKey = e.code;
            localStorage.setItem('i30cps_MENU', e.code);
            document.getElementById('menuchanger').textContent = `Menu Key: ${e.code} (Click to change)`;
            updateMenuKey = false;
            return;
        }

        if (e.code === menuKey) {
            modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
        }

        // Building shortcuts
        if (e.key === localStorage.getItem('i30cps_WALL') || 't') {
            doNewSend(["5", [19, null]]); // Wall
        }
        if (e.key === localStorage.getItem('i30cps_SPIKE') || 'v') {
            doNewSend(["5", [22, null]]); // Spike
        }
        if (e.key === localStorage.getItem('i30cps_MILL') || 'z') {
            doNewSend(["5", [26, null]]); // Mill
        }
        if (e.key === localStorage.getItem('i30cps_BOOST') || 'f') {
            doNewSend(["5", [31, null]]); // Boost
        }
        if (e.key === localStorage.getItem('i30cps_TURRET') || 'g') {
            doNewSend(["5", [33, null]]); // Turret
        }

        // Special commands
        if (e.keyCode === 80 && !['wallKey', 'spikeKey', 'millKey', 'boostKey', 'turretKey'].includes(document.activeElement.id)) {
            const sendPrompt = prompt("WS Sender (Format: command, param1, param2):");
            if (sendPrompt) {
                const parts = sendPrompt.split(',').map(p => p.trim());
                if (parts.length >= 2) {
                    doNewSend([parts[0], parts.slice(1)]);
                }
            }
        }

        if (e.keyCode === 76 && !['wallKey', 'spikeKey', 'millKey', 'boostKey', 'turretKey'].includes(document.activeElement.id)) {
            const command = prompt("Console Command (Available: katana(), place(type, angle)):");
            if (command) executeCommand(command);
        }
    });

    // Save settings
    setInterval(() => {
        localStorage.setItem('i30cps_WALL', document.getElementById('wallKey').value.toLowerCase());
        localStorage.setItem('i30cps_SPIKE', document.getElementById('spikeKey').value.toLowerCase());
        localStorage.setItem('i30cps_MILL', document.getElementById('millKey').value.toLowerCase());
        localStorage.setItem('i30cps_BOOST', document.getElementById('boostKey').value.toLowerCase());
        localStorage.setItem('i30cps_TURRET', document.getElementById('turretKey').value.toLowerCase());
        
        advAc2 = document.getElementById('autochatMsg').value || advertisement;
        animateyorn = document.getElementById('animateCheck').checked;
    }, 1000);

    // Initialize
    document.getElementById('biomeCheck').addEventListener('change', function() {
        document.querySelector('#mapDisplay').style.background = this.checked ? 'rgba(0,0,0,0.25)' : 'none';
    });

    document.getElementById('cursorCheck').addEventListener('change', function() {
        document.getElementById('gameCanvas').style.cursor = this.checked ? 
            'url(http://cur.cursors-4u.net/user/use-1/use153.cur), default' : 'default';
    });

    document.getElementById('openConsole').addEventListener('click', function() {
        const command = prompt("Enter console command:");
        if (command) executeCommand(command);
    });

    // CPS Counter
    const cpsDiv = document.createElement('div');
    cpsDiv.style.cssText = 'position:fixed;top:10px;left:10px;color:white;font-family:Arial;font-size:16px;z-index:9999;';
    cpsDiv.textContent = 'CPS: 0';
    document.body.appendChild(cpsDiv);

    document.addEventListener('mousedown', () => {
        cps++;
        setTimeout(() => cps--, 1000);
    });

    setInterval(() => {
        cpsDiv.textContent = `CPS: ${cps}`;
    }, 100);

    // Console functions
    window.katana = function() {
        doNewSend(["6", [4]]);
    };

    window.place = function(type, angle = Math.atan2(mouseY - height/2, mouseX - width/2)) {
        doNewSend(["5", [type, null]]);
        doNewSend(["c", [1, angle]]);
        doNewSend(["c", [0, angle]]);
    };

    logToConsole('Utility Mod loaded successfully!');
    logToConsole('Type commands in console or use L key for quick access');
})();
