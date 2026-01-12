/**
 * WebSocket Service
 * Manages WebSocket connection for real-time communication
 * @module @socket/WebSocketService
 */

import { io, Socket } from 'socket.io-client';
import { WebSocketEventType, WebSocketMessage, UUID } from '@commonTypes';
import { WS_EVENTS, TIMEOUTS } from '@constants';
import { logger } from '@logger';
import { useAuthStore } from '@stores';

class WebSocketService {
    private static instance: WebSocketService;
    private socket: Socket | null = null;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private eventHandlers: Map<string, Function[]> = new Map();

    private constructor() { }

    static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    /**
     * Connect to WebSocket server
     */
    async connect(url: string): Promise<void> {
        try {
            const token = useAuthStore.getState().token;

            if (!token) {
                throw new Error('No authentication token available');
            }

            logger.info('Connecting to WebSocket server', 'WebSocketService', { url });

            this.socket = io(url, {
                auth: {
                    token,
                },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: TIMEOUTS.WEBSOCKET_RECONNECT,
                timeout: TIMEOUTS.WEBSOCKET_CONNECT,
            });

            this.setupEventHandlers();

            return new Promise((resolve, reject) => {
                if (!this.socket) {
                    reject(new Error('Socket not initialized'));
                    return;
                }

                this.socket.on(WS_EVENTS.CONNECT, () => {
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    logger.info('WebSocket connected', 'WebSocketService');
                    resolve();
                });

                this.socket.on(WS_EVENTS.ERROR, (error: Error) => {
                    logger.error('WebSocket connection error', error, 'WebSocketService');
                    reject(error);
                });

                setTimeout(() => {
                    if (!this.isConnected) {
                        reject(new Error('WebSocket connection timeout'));
                    }
                }, TIMEOUTS.WEBSOCKET_CONNECT);
            });
        } catch (error) {
            logger.error('Failed to connect to WebSocket', error as Error, 'WebSocketService');
            throw error;
        }
    }

    /**
     * Set up default event handlers
     */
    private setupEventHandlers(): void {
        if (!this.socket) return;

        this.socket.on(WS_EVENTS.DISCONNECT, (reason: string) => {
            this.isConnected = false;
            logger.warn('WebSocket disconnected', 'WebSocketService', { reason });
            this.emit('connectionStatusChanged', { isConnected: false });
        });

        this.socket.on(WS_EVENTS.RECONNECT, (attemptNumber: number) => {
            logger.info('WebSocket reconnected', 'WebSocketService', { attemptNumber });
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connectionStatusChanged', { isConnected: true });
        });

        this.socket.on(WS_EVENTS.RECONNECT_ATTEMPT, (attemptNumber: number) => {
            this.reconnectAttempts = attemptNumber;
            logger.debug('WebSocket reconnect attempt', 'WebSocketService', { attemptNumber });
        });

        this.socket.on(WS_EVENTS.RECONNECT_FAILED, () => {
            logger.error(
                'WebSocket reconnection failed',
                new Error('Max reconnection attempts reached'),
                'WebSocketService'
            );
            this.emit('connectionStatusChanged', { isConnected: false, failed: true });
        });
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        if (this.socket) {
            logger.info('Disconnecting from WebSocket', 'WebSocketService');
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.eventHandlers.clear();
        }
    }

    /**
     * Send a message
     */
    send<T = any>(event: string, data: T): void {
        if (!this.socket || !this.isConnected) {
            logger.warn('Cannot send message: WebSocket not connected', 'WebSocketService', {
                event,
            });
            return;
        }

        logger.debug('Sending WebSocket message', 'WebSocketService', { event, data });
        this.socket.emit(event, data);
    }

    /**
     * Subscribe to an event
     */
    on<T = any>(event: string, handler: (data: T) => void): () => void {
        if (!this.socket) {
            logger.warn('Cannot subscribe: WebSocket not initialized', 'WebSocketService', {
                event,
            });
            return () => { };
        }

        logger.debug('Subscribing to WebSocket event', 'WebSocketService', { event });

        // Store handler for cleanup
        const handlers = this.eventHandlers.get(event) || [];
        handlers.push(handler);
        this.eventHandlers.set(event, handlers);

        this.socket.on(event, handler);

        // Return unsubscribe function
        return () => {
            this.off(event, handler);
        };
    }

    /**
     * Unsubscribe from an event
     */
    off<T = any>(event: string, handler: (data: T) => void): void {
        if (!this.socket) return;

        logger.debug('Unsubscribing from WebSocket event', 'WebSocketService', { event });

        this.socket.off(event, handler);

        // Remove from stored handlers
        const handlers = this.eventHandlers.get(event) || [];
        const index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
            if (handlers.length === 0) {
                this.eventHandlers.delete(event);
            } else {
                this.eventHandlers.set(event, handlers);
            }
        }
    }

    /**
     * Emit event to local handlers
     */
    private emit<T = any>(event: string, data: T): void {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.forEach((handler) => {
            try {
                handler(data);
            } catch (error) {
                logger.error('Error in event handler', error as Error, 'WebSocketService', {
                    event,
                });
            }
        });
    }

    /**
     * Join a room
     */
    joinRoom(roomId: UUID): void {
        logger.info('Joining room', 'WebSocketService', { roomId });
        this.send(WS_EVENTS.ROOM_JOIN, { roomId });
    }

    /**
     * Leave a room
     */
    leaveRoom(roomId: UUID): void {
        logger.info('Leaving room', 'WebSocketService', { roomId });
        this.send(WS_EVENTS.ROOM_LEAVE, { roomId });
    }

    /**
     * Send WebRTC signaling message
     */
    sendSignal(event: string, data: any): void {
        logger.debug('Sending WebRTC signal', 'WebSocketService', { event });
        this.send(event, data);
    }

    /**
     * Check if connected
     */
    isSocketConnected(): boolean {
        return this.isConnected;
    }

    /**
     * Get reconnection attempts
     */
    getReconnectAttempts(): number {
        return this.reconnectAttempts;
    }
}

export const webSocketService = WebSocketService.getInstance();
