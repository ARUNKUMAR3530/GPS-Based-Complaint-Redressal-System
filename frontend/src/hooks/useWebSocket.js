import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import AuthService from '../services/auth.service';

const WS_URL = 'http://localhost:8081/ws';

const useWebSocket = (topic, onMessageReceived) => {
    // Use a ref so that changing callbacks don't re-trigger the effect
    const onMessageRef = useRef(onMessageReceived);
    useEffect(() => {
        onMessageRef.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (!user || !topic) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            connectHeaders: {
                Authorization: `Bearer ${user.token}`
            },
            onConnect: () => {
                console.log('[WS] Connected. Subscribing to:', topic);
                client.subscribe(topic, (message) => {
                    try {
                        onMessageRef.current(JSON.parse(message.body));
                    } catch (e) {
                        console.error('[WS] Failed to parse message:', e);
                    }
                });
            },
            onDisconnect: () => {
                console.log('[WS] Disconnected.');
            },
            onStompError: (frame) => {
                console.error('[WS] STOMP error:', frame.headers['message']);
            },
            debug: () => { },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.activate();

        return () => {
            client.deactivate();
        };
        // Only re-connect when topic changes — not when callback changes
    }, [topic]);
};

export default useWebSocket;
