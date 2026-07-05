import { Client } from '@stomp/stompjs';

let stompClient = null;

const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  if (window.location.port === '5174') {
    return 'ws://localhost:8081/ws';
  }
  return `${protocol}//${host}/ws`;
};

const WS_URL = getWsUrl();

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
