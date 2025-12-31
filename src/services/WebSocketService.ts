import { WS_URL } from '../config';

type MessageHandler = (message: any) => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: MessageHandler[] = [];
    private reconnectInterval: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private subscribedTopics: Set<string> = new Set();
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private lastMessageTime: number = Date.now();

    connect() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

        console.log('Connecting to WebSocket:', WS_URL);
        this.socket = new WebSocket(WS_URL);

        this.socket.onopen = () => {
            console.log('WebSocket Connected');
            this.reconnectAttempts = 0;

            if (this.reconnectInterval) {
                clearInterval(this.reconnectInterval);
                this.reconnectInterval = null;
            }

            // Resubscribe to all topics after reconnection
            this.subscribedTopics.forEach(topicId => {
                this.subscribe(topicId);
            });

            // Start heartbeat monitoring
            this.startHeartbeat();
        };

        this.socket.onmessage = (event) => {
            this.lastMessageTime = Date.now();

            try {
                const message = JSON.parse(event.data);
                this.listeners.forEach((listener) => listener(message));
            } catch (e) {
                console.error('Error parsing WebSocket message:', e);
            }
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket Disconnected. Code:', event.code, 'Reason:', event.reason);
            this.socket = null;
            this.stopHeartbeat();
            this.startReconnect();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };
    }

    private startHeartbeat() {
        this.stopHeartbeat();

        // Check connection health every 10 seconds
        this.heartbeatInterval = setInterval(() => {
            const timeSinceLastMessage = Date.now() - this.lastMessageTime;

            // If no message received in 60 seconds, connection might be dead
            if (timeSinceLastMessage > 60000) {
                console.warn('No WebSocket activity for 60s, reconnecting...');
                this.socket?.close();
            }
        }, 10000);
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    private startReconnect() {
        if (this.reconnectInterval) return;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

        this.reconnectInterval = setTimeout(() => {
            this.reconnectAttempts++;
            this.reconnectInterval = null;
            this.connect();
        }, delay);
    }

    subscribe(topicId: string) {
        this.subscribedTopics.add(topicId);

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            try {
                this.socket.send(JSON.stringify({ action: 'subscribe', topic_id: topicId }));
                console.log('Subscribed to topic:', topicId);
            } catch (e) {
                console.error('Error subscribing to topic:', e);
            }
        }
    }

    unsubscribe(topicId: string) {
        this.subscribedTopics.delete(topicId);
    }

    addListener(listener: MessageHandler) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    disconnect() {
        this.stopHeartbeat();

        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        if (this.reconnectInterval) {
            clearTimeout(this.reconnectInterval);
            this.reconnectInterval = null;
        }

        this.subscribedTopics.clear();
    }

    getConnectionState(): string {
        if (!this.socket) return 'DISCONNECTED';

        switch (this.socket.readyState) {
            case WebSocket.CONNECTING: return 'CONNECTING';
            case WebSocket.OPEN: return 'OPEN';
            case WebSocket.CLOSING: return 'CLOSING';
            case WebSocket.CLOSED: return 'CLOSED';
            default: return 'UNKNOWN';
        }
    }
}

export const webSocketService = new WebSocketService();
