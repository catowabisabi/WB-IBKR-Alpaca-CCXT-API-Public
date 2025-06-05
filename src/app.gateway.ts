import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

// 這個WebSocket Gateway 是為了讓 NestJS 處理 WebSocket 連線, 主要用放連接用戶主機的WealthBehave Client, 連接IBKR TWS API
// This WebSocket Gateway is for NestJS to handle WebSocket connections, mainly used to connect WealthBehave Client on the user's machine, and connect to the IBKR TWS API

// 建立一個 WebSocket Gateway，讓 NestJS 處理 WebSocket 連線
// Create a WebSocket Gateway for handling WebSocket connections in NestJS
@WebSocketGateway()
export class AppGateway {
    // 注入 Socket.IO 伺服器實例，方便用來廣播或傳送訊息
    // Inject the Socket.IO server instance for broadcasting or sending messages
    @WebSocketServer() server: Server;

    // 自訂一個方法，透過 Socket.IO 伺服器向所有連線的客戶端發送訊息
    // Custom method to send a message to all connected clients via Socket.IO server
    sendToClient(msg: string) {
       // 透過 'console-message' 事件發送一個物件，包含日誌等級與訊息內容
       // Emit a 'console-message' event with an object containing log level and message content
        this.server.emit('console-message', { level: 'log', message: msg });
    }
}
