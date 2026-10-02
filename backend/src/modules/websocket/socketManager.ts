import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import url from 'url';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AuthUserPayload } from '../../types/auth.types';

interface AuthenticatedSocket extends WebSocket {
  user?: AuthUserPayload;
  isAlive?: boolean;
}

export class SocketManager {
  private wss: WebSocketServer | null = null;
  private userSockets: Map<string, Set<AuthenticatedSocket>> = new Map();

  initialize(server: http.Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: AuthenticatedSocket, req: http.IncomingMessage) => {
      ws.isAlive = true;
      ws.on('pong', () => { ws.isAlive = true; });

      // Authenticate via ?token= query parameter
      const parsedUrl = url.parse(req.url || '', true);
      const token = parsedUrl.query.token as string | undefined;

      if (token) {
        try {
          const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthUserPayload;
          ws.user = decoded;
          const userSet = this.userSockets.get(decoded.userId) || new Set();
          userSet.add(ws);
          this.userSockets.set(decoded.userId, userSet);

          ws.send(JSON.stringify({
            type: 'CONNECTED',
            payload: { message: 'WebSocket synchronized successfully', userId: decoded.userId },
          }));
        } catch (err: any) {
          ws.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'Invalid token' }));
          ws.close(4001, 'Unauthorized');
          return;
        }
      } else {
        // Anonymous observer mode
        ws.send(JSON.stringify({ type: 'CONNECTED', payload: { message: 'Connected as guest observer' } }));
      }

      ws.on('close', () => {
        if (ws.user) {
          const userSet = this.userSockets.get(ws.user.userId);
          if (userSet) {
            userSet.delete(ws);
            if (userSet.size === 0) this.userSockets.delete(ws.user.userId);
          }
        }
      });
    });

    // Heartbeat ping interval
    const interval = setInterval(() => {
      if (!this.wss) return;
      this.wss.clients.forEach((ws: WebSocket) => {
        const authWs = ws as AuthenticatedSocket;
        if (authWs.isAlive === false) return authWs.terminate();
        authWs.isAlive = false;
        authWs.ping();
      });
    }, 30000);
    interval.unref();

    this.wss.on('close', () => clearInterval(interval));
    console.log('✅ WebSocket server initialized on path /ws');
  }

  close() {
    if (this.wss) {
      this.wss.close();
    }
  }

  sendToUser(userId: string, event: string, payload: any) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    const msg = JSON.stringify({ type: event, payload, timestamp: Date.now() });
    sockets.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    });
  }

  broadcast(event: string, payload: any) {
    if (!this.wss) return;
    const msg = JSON.stringify({ type: event, payload, timestamp: Date.now() });
    this.wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    });
  }
}

export const socketManager = new SocketManager();
