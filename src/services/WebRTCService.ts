/**
 * WebRTC Service
 * High-level service for managing WebRTC connections
 * Wraps native WebRTC module with business logic
 * @module @services/WebRTCService
 */

import { NativeModules, NativeEventEmitter } from 'react-native';
import {
    IWebRTCNativeModule,
    WebRTCPeerConfig,
    WebRTCOffer,
    WebRTCAnswer,
    WebRTCIceCandidate,
} from '@interfaces/NativeBridgeInterfaces';
import { UUID } from '@commonTypes';
import { WEBRTC_CONFIG } from '@constants';
import { logger } from '@logger';

// For development: Use react-native-webrtc directly
// In production: Implement native modules
import {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate as RNIceCandidate,
    mediaDevices,
    MediaStream,
    MediaStreamTrack,
} from 'react-native-webrtc';

/**
 * WebRTC Service
 * Manages peer connections, offers, answers, and ICE candidates
 */
class WebRTCService {
    private static instance: WebRTCService;
    private peerConnections: Map<UUID, RTCPeerConnection> = new Map();
    private localStream: MediaStream | null = null;

    private constructor() { }

    static getInstance(): WebRTCService {
        if (!WebRTCService.instance) {
            WebRTCService.instance = new WebRTCService();
        }
        return WebRTCService.instance;
    }

    /**
     * Initialize local media stream (audio only for voice chat)
     */
    async initializeLocalStream(audioOnly: boolean = true): Promise<MediaStream> {
        try {
            logger.info('Initializing local media stream', 'WebRTCService', { audioOnly });

            const constraints = audioOnly
                ? {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                    video: false,
                }
                : {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        frameRate: { ideal: 30 },
                    },
                };

            const stream = await mediaDevices.getUserMedia(constraints);
            this.localStream = stream;

            logger.info('Local media stream initialized', 'WebRTCService', {
                streamId: stream.id,
                audioTracks: stream.getAudioTracks().length,
                videoTracks: stream.getVideoTracks().length,
            });

            return stream;
        } catch (error) {
            logger.error('Failed to initialize local stream', error as Error, 'WebRTCService');
            throw error;
        }
    }

    /**
     * Create a new peer connection
     */
    async createPeerConnection(
        connectionId: UUID,
        onIceCandidate: (candidate: WebRTCIceCandidate) => void,
        onAddStream: (stream: MediaStream) => void,
        onRemoveStream: () => void,
        onConnectionStateChange: (state: string) => void,
    ): Promise<RTCPeerConnection> {
        try {
            logger.info('Creating peer connection', 'WebRTCService', { connectionId });

            const configuration = {
                iceServers: WEBRTC_CONFIG.iceServers,
                iceCandidatePoolSize: WEBRTC_CONFIG.iceCandidatePoolSize,
            };

            const pc = new RTCPeerConnection(configuration);

            // Set up event handlers
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    const candidate: WebRTCIceCandidate = {
                        candidate: event.candidate.candidate,
                        sdpMid: event.candidate.sdpMid,
                        sdpMLineIndex: event.candidate.sdpMLineIndex,
                    };
                    logger.debug('ICE candidate generated', 'WebRTCService', { connectionId });
                    onIceCandidate(candidate);
                }
            };

            pc.onaddstream = (event) => {
                logger.info('Remote stream added', 'WebRTCService', {
                    connectionId,
                    streamId: event.stream.id,
                });
                onAddStream(event.stream as MediaStream);
            };

            pc.onremovestream = () => {
                logger.info('Remote stream removed', 'WebRTCService', { connectionId });
                onRemoveStream();
            };

            pc.oniceconnectionstatechange = () => {
                logger.debug('ICE connection state changed', 'WebRTCService', {
                    connectionId,
                    state: pc.iceConnectionState,
                });
                onConnectionStateChange(pc.iceConnectionState);
            };

            pc.onconnectionstatechange = () => {
                logger.debug('Connection state changed', 'WebRTCService', {
                    connectionId,
                    state: pc.connectionState,
                });
            };

            // Add local stream if available
            if (this.localStream) {
                logger.debug('Adding local stream to peer connection', 'WebRTCService', {
                    connectionId,
                });
                pc.addStream(this.localStream);
            }

            this.peerConnections.set(connectionId, pc);
            return pc;
        } catch (error) {
            logger.error('Failed to create peer connection', error as Error, 'WebRTCService', {
                connectionId,
            });
            throw error;
        }
    }

    /**
     * Create an offer
     */
    async createOffer(connectionId: UUID): Promise<WebRTCOffer> {
        try {
            const pc = this.peerConnections.get(connectionId);
            if (!pc) {
                throw new Error(`No peer connection found for ID: ${connectionId}`);
            }

            logger.info('Creating offer', 'WebRTCService', { connectionId });

            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: false,
            });

            await pc.setLocalDescription(offer);

            logger.info('Offer created and set as local description', 'WebRTCService', {
                connectionId,
            });

            return {
                type: 'offer',
                sdp: offer.sdp || '',
            };
        } catch (error) {
            logger.error('Failed to create offer', error as Error, 'WebRTCService', {
                connectionId,
            });
            throw error;
        }
    }

    /**
     * Create an answer
     */
    async createAnswer(connectionId: UUID): Promise<WebRTCAnswer> {
        try {
            const pc = this.peerConnections.get(connectionId);
            if (!pc) {
                throw new Error(`No peer connection found for ID: ${connectionId}`);
            }

            logger.info('Creating answer', 'WebRTCService', { connectionId });

            const answer = await pc.createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: false,
            });

            await pc.setLocalDescription(answer);

            logger.info('Answer created and set as local description', 'WebRTCService', {
                connectionId,
            });

            return {
                type: 'answer',
                sdp: answer.sdp || '',
            };
        } catch (error) {
            logger.error('Failed to create answer', error as Error, 'WebRTCService', {
                connectionId,
            });
            throw error;
        }
    }

    /**
     * Set remote description
     */
    async setRemoteDescription(
        connectionId: UUID,
        description: WebRTCOffer | WebRTCAnswer,
    ): Promise<void> {
        try {
            const pc = this.peerConnections.get(connectionId);
            if (!pc) {
                throw new Error(`No peer connection found for ID: ${connectionId}`);
            }

            logger.info('Setting remote description', 'WebRTCService', {
                connectionId,
                type: description.type,
            });

            await pc.setRemoteDescription(new RTCSessionDescription(description));

            logger.info('Remote description set successfully', 'WebRTCService', {
                connectionId,
            });
        } catch (error) {
            logger.error('Failed to set remote description', error as Error, 'WebRTCService', {
                connectionId,
            });
            throw error;
        }
    }

    /**
     * Add ICE candidate
     */
    async addIceCandidate(
        connectionId: UUID,
        candidate: WebRTCIceCandidate,
    ): Promise<void> {
        try {
            const pc = this.peerConnections.get(connectionId);
            if (!pc) {
                throw new Error(`No peer connection found for ID: ${connectionId}`);
            }

            logger.debug('Adding ICE candidate', 'WebRTCService', { connectionId });

            await pc.addIceCandidate(new RNIceCandidate(candidate));

            logger.debug('ICE candidate added successfully', 'WebRTCService', {
                connectionId,
            });
        } catch (error) {
            logger.error('Failed to add ICE candidate', error as Error, 'WebRTCService', {
                connectionId,
            });
            // Don't throw - ICE candidate failures are often non-critical
        }
    }

    /**
     * Close peer connection
     */
    async closePeerConnection(connectionId: UUID): Promise<void> {
        try {
            const pc = this.peerConnections.get(connectionId);
            if (!pc) {
                logger.warn('No peer connection to close', 'WebRTCService', { connectionId });
                return;
            }

            logger.info('Closing peer connection', 'WebRTCService', { connectionId });

            pc.close();
            this.peerConnections.delete(connectionId);

            logger.info('Peer connection closed', 'WebRTCService', { connectionId });
        } catch (error) {
            logger.error('Failed to close peer connection', error as Error, 'WebRTCService', {
                connectionId,
            });
        }
    }

    /**
     * Stop local stream
     */
    stopLocalStream(): void {
        if (this.localStream) {
            logger.info('Stopping local stream', 'WebRTCService');

            this.localStream.getTracks().forEach((track) => {
                track.stop();
            });

            this.localStream.release();
            this.localStream = null;

            logger.info('Local stream stopped', 'WebRTCService');
        }
    }

    /**
     * Mute/unmute local audio
     */
    setLocalAudioEnabled(enabled: boolean): void {
        if (!this.localStream) {
            logger.warn('No local stream available', 'WebRTCService');
            return;
        }

        logger.debug('Setting local audio', 'WebRTCService', { enabled });

        this.localStream.getAudioTracks().forEach((track) => {
            track.enabled = enabled;
        });
    }

    /**
     * Get local stream
     */
    getLocalStream(): MediaStream | null {
        return this.localStream;
    }

    /**
     * Get peer connection
     */
    getPeerConnection(connectionId: UUID): RTCPeerConnection | undefined {
        return this.peerConnections.get(connectionId);
    }

    /**
     * Clean up all resources
     */
    cleanup(): void {
        logger.info('Cleaning up WebRTC service', 'WebRTCService');

        // Close all peer connections
        this.peerConnections.forEach((pc, connectionId) => {
            this.closePeerConnection(connectionId);
        });

        // Stop local stream
        this.stopLocalStream();

        logger.info('WebRTC service cleanup complete', 'WebRTCService');
    }
}

export const webRTCService = WebRTCService.getInstance();
