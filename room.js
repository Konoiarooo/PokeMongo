export class Room{
    id;
    users = Array();
    status = 'WAITING' | 'READY';

    addUser(user){
        this.users.push(user);
        this.status = 'READY';
        user.RoomId = this.id; 
    }

    createRoom(user){
        this.id = Math.random() * 100;
        this.users.push(user);
        this.status = 'WAITING';
        user.RoomId = this.id;
    }

    findRoomExists(roomList){
        return roomList.find((room) => room.status !== undefined && room.status === 'WAITING');
    }
}