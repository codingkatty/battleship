// server/index.js
const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Game rooms storage
const rooms = new Map();
const waitingPlayers = new Set();

wss.on('connection', (ws) => {
    const playerId = uuidv4();
    ws.playerId = playerId;

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch(data.type) {
            case 'find_game':
                handleMatchmaking(ws);
                break;
            case 'move':
                handleMove(ws, data);
                break;
            case 'place_ships':
                handleShipPlacement(ws, data);
                break;
        }
    });

    ws.on('close', () => {
        handlePlayerDisconnect(ws);
    });
});

function handleMatchmaking(ws) {
    if (waitingPlayers.size > 0) {
        const opponent = waitingPlayers.values().next().value;
        waitingPlayers.delete(opponent);
        
        const roomId = uuidv4();
        rooms.set(roomId, {
            players: [ws, opponent],
            ready: 0,
            boards: [{}, {}]
        });

        ws.roomId = roomId;
        opponent.roomId = roomId;

        const message = JSON.stringify({
            type: 'game_start',
            roomId
        });

        ws.send(message);
        opponent.send(message);
    } else {
        waitingPlayers.add(ws);
        ws.send(JSON.stringify({ type: 'waiting' }));
    }
}

function handleMove(ws, data) {
    const room = rooms.get(data.roomId);
    if (!room) return;

    const opponent = room.players.find(p => p.playerId !== ws.playerId);
    opponent.send(JSON.stringify({
        type: 'opponent_move',
        row: data.row,
        col: data.col
    }));
}

function handleShipPlacement(ws, data) {
    const room = rooms.get(data.roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.playerId === ws.playerId);
    room.boards[playerIndex] = data.board;
    room.ready++;

    if (room.ready === 2) {
        room.players.forEach((player, index) => {
            player.send(JSON.stringify({
                type: 'all_ready',
                yourBoard: room.boards[index],
                opponentBoard: room.boards[index === 0 ? 1 : 0]
            }));
        });
    }
}

function handlePlayerDisconnect(ws) {
    waitingPlayers.delete(ws);
    
    if (ws.roomId) {
        const room = rooms.get(ws.roomId);
        if (room) {
            const opponent = room.players.find(p => p.playerId !== ws.playerId);
            if (opponent) {
                opponent.send(JSON.stringify({ type: 'opponent_disconnected' }));
            }
            rooms.delete(ws.roomId);
        }
    }
}

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});