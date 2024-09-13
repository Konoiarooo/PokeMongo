export class Room{
    id;
    users = [];
    status = 'WAITING' | 'READY';

    addUser(user){
        this.users.push(user);
        this.status = 'READY';
        user.roomId = this.id; 
    }

    createRoom(user){
        this.id = Math.random() * 100;
        this.users.push(user);
        this.status = 'WAITING';
        user.roomId = this.id;
    }

    findRoomExists(roomList){
        return roomList.find((room) => room.status !== undefined && room.status === 'WAITING');
    }
}