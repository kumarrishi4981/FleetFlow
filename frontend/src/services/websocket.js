import { Client } from '@stomp/stompjs';

let stompClient = null;

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8081/ws';

export function connectWebSocket(onMessage) {
  if (stompClient && stompClient.connected) {
    return;
  }

  stompClient = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      if (import.meta.env.DEV) {
        console.log('[STOMP]', str);
      }
    },
    onConnect: () => {
      console.log('[WebSocket] Connected to FleetFlow');
      stompClient.subscribe('/topic/vehicles', (message) => {
        try {
          const data = JSON.parse(message.body);
          onMessage(data);
        } catch (err) {
          console.error('[WebSocket] Parse error:', err);
        }
      });
    },
    onStompError: (frame) => {
      console.error('[WebSocket] STOMP error:', frame.headers['message']);
    },
    onWebSocketClose: () => {
      console.log('[WebSocket] Connection closed');
    },
  });

  stompClient.activate();
}

export function disconnectWebSocket() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log('[WebSocket] Disconnected');
  }
}
