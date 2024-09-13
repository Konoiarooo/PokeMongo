import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import path from 'path';
import { fileURLToPath } from 'url';

import { Room } from './room.js';

const app = express();
const server = http.createServer(app);
const io  = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const port = 3000;
app.use(express.static(__dirname + "/src"));
server.listen(port, () => console.log(`Server listening on port ${port}`));

const rooms = [];

io.on('connection', (socket) => {
    console.log(`Connection ${socket.id}`)
    
    socket.on("seach_game", (user) => {
        addUserToRoom(user, socket);
        
        rooms.forEach(room => {
            if(room?.status === 'READY')
                socket.on('start_game', () => io.to(room.id).emit('start_game', room.users));
        });
    })

})

function addUserToRoom(user, socket){
    const room = new Room();
    const roomInUse = room.findRoomExists(rooms);

    if(rooms.length === 0 || roomInUse === undefined){
        
        if(user.room === null){
            room.createRoom(user);
            rooms.push(room);
            socket.join(room.id);
        }
    }
    else if (roomInUse){
        roomInUse.addUser(user);
        socket.join(roomInUse.id);

        console.log(`Batalha na sala ${roomInUse.id} iniciada!`);
    }
}