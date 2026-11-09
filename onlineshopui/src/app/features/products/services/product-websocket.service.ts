import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { EnvironmentConfig } from '../../../core/types/providers/environment-config';
import { ProductEventDto } from '../../../core/types/dtos/product-event.dto';
import { AuthService } from '../../auth/services/auth.service';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

@Injectable({
    providedIn: 'root'
})
export class ProductWebSocketService {
    private readonly environmentConfig = inject(EnvironmentConfig);
    private readonly authService = inject(AuthService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly eventsSubject = new Subject<ProductEventDto>();

    private client: Client | null = null;
    private subscription: StompSubscription | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private reconnectAttempt = 0;
    private manuallyDisconnected = false;

    readonly events = this.eventsSubject.asObservable();
    readonly connectionState = signal<ConnectionState>('disconnected');

    constructor() {
        effect(() => {
            if (this.authService.isAuthenticated()) {
                this.connect();
            } else {
                this.disconnect();
            }
        });

        this.destroyRef.onDestroy(() => this.disconnect());
    }

    connect(): void {
        if (this.environmentConfig.envType === 'mock') {
            return;
        }

        this.manuallyDisconnected = false;
        if (this.client?.active || this.reconnectTimer) {
            return;
        }

        this.activateClient();
    }

    disconnect(): void {
        this.manuallyDisconnected = true;
        this.clearReconnectTimer();
        this.reconnectAttempt = 0;
        this.subscription?.unsubscribe();
        this.subscription = null;

        const client = this.client;
        this.client = null;
        if (client) {
            void client.deactivate();
        }

        this.connectionState.set('disconnected');
    }

    private activateClient(): void {
        const token = this.authService.getToken();
        if (!token || this.manuallyDisconnected) {
            return;
        }

        this.connectionState.set(this.reconnectAttempt > 0 ? 'reconnecting' : 'connecting');
        const client = new Client({
            brokerURL: this.toWebSocketUrl(`${this.environmentConfig.apiUrl}/ws`),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 0
        });

        this.client = client;
        client.onConnect = () => {
            if (this.client !== client) {
                return;
            }

            this.reconnectAttempt = 0;
            this.connectionState.set('connected');
            this.subscription = client.subscribe('/topic/products', message =>
                this.handleMessage(message)
            );
        };
        client.onWebSocketClose = () => this.handleConnectionLoss(client);
        client.onWebSocketError = () => this.handleConnectionLoss(client);
        client.onStompError = () => this.handleConnectionLoss(client);
        void client.activate();
    }

    private handleMessage(message: IMessage): void {
        try {
            const event = JSON.parse(message.body) as ProductEventDto;
            if (
                !event.eventId ||
                !event.action ||
                !event.productId ||
                !event.occurredAt ||
                (event.action !== 'DELETED' && !event.product)
            ) {
                throw new Error('Invalid product event payload');
            }

            this.eventsSubject.next(event);
        } catch (error) {
            console.error('Unable to process product WebSocket event', error);
        }
    }

    private handleConnectionLoss(client: Client): void {
        if (this.client !== client || this.manuallyDisconnected) {
            return;
        }

        this.client = null;
        this.subscription?.unsubscribe();
        this.subscription = null;
        void client.deactivate();
        this.scheduleReconnect();
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer || this.manuallyDisconnected || !this.authService.isAuthenticated()) {
            return;
        }

        const baseDelay = Math.min(30_000, 1_000 * 2 ** this.reconnectAttempt);
        const jitter = Math.floor(Math.random() * Math.min(250, baseDelay * 0.1));
        this.reconnectAttempt += 1;
        this.connectionState.set('reconnecting');
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.activateClient();
        }, baseDelay + jitter);
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private toWebSocketUrl(url: string): string {
        return url.replace(/^http/, 'ws');
    }
}
