// my.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken'; //如果更新了JWT_KEY，需要重新啟動伺服器, 所有使用者需要重新登入 (If you update JWT_KEY, you need to restart the server, and all users need to re-login)

interface DecodedToken {
  email: string;
}

interface SendSignalToClientParams {
  email: string;
  type: string;
  message: any;
}

@WebSocketGateway()
export class MyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private clientMap = new Map<string, Socket>();
  private jwt_key: string = process.env.JWT_KEY || 'default_jwt_key';

  handleConnection(client: Socket) {
    //每當有使用者透過 WebSocket 連上來時，handleConnection() 會從 client.handshake.query.token 中取得 JWT Token，並使用 verifyToken() 方法解析出使用者的 email
    const { token } = client.handshake.query;
    const { email, error } = this.verifyToken(token as string);

    if (error) {
      console.error('JWT verification failed:', error);
      client.emit('auth_error', { message: 'Authentication failed' });
      client.disconnect();
      return;
    }

    //如果 JWT Token 驗證成功，則將使用者的 email 和 Socket 實體存儲在 clientMap 中
    this.clientMap.set(email, client);
    console.log('Client connected with email:', email);
  }

  handleDisconnect(client: Socket) {
    //當使用者斷線時，handleDisconnect() 會從 client.handshake.query.token 中取得 JWT Token，並使用 verifyToken() 方法解析出使用者的 email
    const { token } = client.handshake.query;
    const { email, error } = this.verifyToken(token as string);

    //如果 JWT Token 驗證成功，則將使用者的 email 從 clientMap 中刪除
    if (error) {
      console.error('JWT verification failed:', error);
    } else {
      this.clientMap.delete(email);
      console.log('Client disconnected with email:', email);
    }
  }

  //sendSignalToClient() 方法用於將交易訊號發送到指定的使用者
  sendSignalToClient({ email, type, message }: SendSignalToClientParams) {
    const client = this.clientMap.get(email);
    if (client) {
      client.emit(type, message);
      console.log('己經把交易訊號由線上發到線下')
      console.log(type, message)
    }
  }

  //verifyToken() 方法用於驗證 JWT Token
  private verifyToken(token: string): { email: string; error: any } {
    try {
      const decoded = jwt.verify(token, this.jwt_key) as DecodedToken;
      const email = decoded.email;
      return { email, error: null };
    } catch (error) {
      return { email: '', error };
    }
  }
}