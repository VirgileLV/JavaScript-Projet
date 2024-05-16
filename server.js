const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const R = require('ramda');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let gameState = [
  ['', '', ''],
  ['', '', ''],
  ['', '', '']
];

let currentPlayer = 'X';

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.emit('gameState', gameState);

  socket.on('makeMove', (move) => {
    const { row, col } = move;
    if (gameState[row][col] === '') {
      gameState[row][col] = currentPlayer;
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      io.emit('gameState', gameState);

      if (checkWinner(gameState)) {
        io.emit('gameOver', currentPlayer === 'X' ? 'O' : 'X');
        resetGame();
      } else if (R.flatten(gameState).every(cell => cell !== '')) {
        io.emit('gameOver', 'Draw');
        resetGame();
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const checkWinner = (board) => {
  const winningCombinations = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]]
  ];

  return R.any(combination => {
    const [a, b, c] = combination;
    return board[a[0]][a[1]] !== '' &&
           board[a[0]][a[1]] === board[b[0]][b[1]] &&
           board[a[0]][a[1]] === board[c[0]][c[1]];
  }, winningCombinations);
};

const resetGame = () => {
  gameState = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ];
  currentPlayer = 'X';
};

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
