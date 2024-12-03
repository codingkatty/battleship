// game.js
class Battleship {
    constructor() {
        this.boardSize = 10;
        this.ships = [
            { size: 5, name: 'Carrier' },
            { size: 4, name: 'Battleship' },
            { size: 3, name: 'Cruiser' },
            { size: 3, name: 'Submarine' },
            { size: 2, name: 'Destroyer' }
        ];
        this.playerBoard = this.createBoard();
        this.enemyBoard = this.createBoard();
        this.isPlayerTurn = true;
        this.gameMode = 'single';
        this.ws = null;
        this.roomId = null;
        this.playerId = null;
        this.isMyTurn = false;
        this.BACKEND_URL = 'https://battleship-0nbr.onrender.com'; // Change this to your Render URL
    }

    createBoard() {
        return Array(this.boardSize).fill().map(() => 
            Array(this.boardSize).fill(null));
    }

    placeShip(board, ship, row, col, isVertical) {
        if (this.canPlaceShip(board, ship, row, col, isVertical)) {
            for (let i = 0; i < ship.size; i++) {
                if (isVertical) {
                    board[row + i][col] = ship.name;
                } else {
                    board[row][col + i] = ship.name;
                }
            }
            return true;
        }
        return false;
    }

    canPlaceShip(board, ship, row, col, isVertical) {
        if (isVertical) {
            if (row + ship.size > this.boardSize) return false;
            for (let i = 0; i < ship.size; i++) {
                if (board[row + i][col]) return false;
            }
        } else {
            if (col + ship.size > this.boardSize) return false;
            for (let i = 0; i < ship.size; i++) {
                if (board[row][col + i]) return false;
            }
        }
        return true;
    }

    attack(row, col) {
        if (this.gameMode === 'multi') {
            if (this.isMyTurn) {
                this.sendMove(row, col);
            }
            return;
        }

        if (this.gameMode === 'single' && !this.isPlayerTurn) {
            return this.aiMove();
        }

        const targetBoard = this.isPlayerTurn ? this.enemyBoard : this.playerBoard;
        if (targetBoard[row][col] === 'hit' || targetBoard[row][col] === 'miss') {
            return false;
        }

        const isHit = targetBoard[row][col] !== null;
        targetBoard[row][col] = isHit ? 'hit' : 'miss';
        this.isPlayerTurn = !this.isPlayerTurn;
        
        if (this.gameMode === 'single' && !this.isPlayerTurn) {
            setTimeout(() => this.aiMove(), 500);
        }
        
        return true;
    }

    aiMove() {
        let row, col;
        do {
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * this.boardSize);
        } while (!this.attack(row, col));
    }

    connectToServer() {
        this.ws = new WebSocket(this.BACKEND_URL);
        
        this.ws.onopen = () => {
            console.log('Connected to server');
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleServerMessage(data);
        };

        this.ws.onclose = () => {
            console.log('Disconnected from server');
            setTimeout(() => this.connectToServer(), 3000); // Reconnect attempt
        };
    }

    handleServerMessage(data) {
        switch(data.type) {
            case 'waiting':
                // Show waiting message
                break;
            case 'game_start':
                this.roomId = data.roomId;
                this.placeShipsRandomly();
                this.sendShipPlacement();
                break;
            case 'all_ready':
                this.isMyTurn = true;
                this.updateBoards();
                break;
            case 'opponent_move':
                this.handleOpponentMove(data.row, data.col);
                this.isMyTurn = true;
                break;
            case 'opponent_disconnected':
                alert('Opponent disconnected');
                break;
        }
    }

    startMultiPlayer() {
        this.gameMode = 'multi';
        this.connectToServer();
        this.ws.send(JSON.stringify({ type: 'find_game' }));
    }

    sendMove(row, col) {
        if (!this.isMyTurn || this.gameMode !== 'multi') return;
        
        this.ws.send(JSON.stringify({
            type: 'move',
            roomId: this.roomId,
            row: row,
            col: col
        }));
        this.isMyTurn = false;
    }

    sendShipPlacement() {
        this.ws.send(JSON.stringify({
            type: 'place_ships',
            roomId: this.roomId,
            board: this.playerBoard
        }));
    }

    handleOpponentMove(row, col) {
        const result = this.attack(row, col);
        this.updateBoards();
        return result;
    }
}

// Initialize game
let game;

function startSinglePlayer() {
    game = new Battleship();
    game.gameMode = 'single';
    initializeBoards();
    placeShipsRandomly();
}

// Modify existing startMultiPlayer function
function startMultiPlayer() {
    game = new Battleship();
    game.startMultiPlayer();
    initializeBoards();
}

function initializeBoards() {
    const playerBoard = document.getElementById('playerBoard');
    const enemyBoard = document.getElementById('enemyBoard');
    
    playerBoard.innerHTML = '';
    enemyBoard.innerHTML = '';

    for (let i = 0; i < game.boardSize; i++) {
        for (let j = 0; j < game.boardSize; j++) {
            playerBoard.appendChild(createCell(i, j, true));
            enemyBoard.appendChild(createCell(i, j, false));
        }
    }
}

function createCell(row, col, isPlayer) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.row = row;
    cell.dataset.col = col;
    
    if (!isPlayer) {
        cell.onclick = () => {
            if (game.isPlayerTurn) {
                game.attack(row, col);
                updateBoards();
            }
        };
    }
    return cell;
}

function placeShipsRandomly() {
    game.ships.forEach(ship => {
        let placed = false;
        while (!placed) {
            const row = Math.floor(Math.random() * game.boardSize);
            const col = Math.floor(Math.random() * game.boardSize);
            const isVertical = Math.random() < 0.5;
            placed = game.placeShip(game.playerBoard, ship, row, col, isVertical);
            if (placed) {
                game.placeShip(game.enemyBoard, ship, row, col, isVertical);
            }
        }
    });
    updateBoards();
}

function updateBoards() {
    for (let i = 0; i < game.boardSize; i++) {
        for (let j = 0; j < game.boardSize; j++) {
            const playerCell = document.querySelector(`#playerBoard .cell[data-row="${i}"][data-col="${j}"]`);
            const enemyCell = document.querySelector(`#enemyBoard .cell[data-row="${i}"][data-col="${j}"]`);
            
            if (game.playerBoard[i][j]) {
                playerCell.classList.add(game.playerBoard[i][j] === 'hit' ? 'hit' : 
                    game.playerBoard[i][j] === 'miss' ? 'miss' : 'ship');
            }
            
            if (game.enemyBoard[i][j] === 'hit' || game.enemyBoard[i][j] === 'miss') {
                enemyCell.classList.add(game.enemyBoard[i][j]);
            }
        }
    }
}

// Add event listener for page unload
window.addEventListener('beforeunload', () => {
    if (game && game.ws) {
        game.ws.close();
    }
});