import { TestBed } from '@angular/core/testing';
import { ClientSocketService } from './client-socket.service';
import { Socket } from 'socket.io-client';

type CallbackSignature = (params: unknown) => {};

export class SocketTestHelper {
    private callbacks = new Map<string, CallbackSignature[]>();

    on(event: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }

        this.callbacks.get(event)?.push(callback);
    }

    emit(event: string, params: unknown) {
        return;
    }

    disconnect(): void {
        return;
    }

    peerSideEmit(event: string, params?: unknown) {
        if (!this.callbacks.has(event)) {
            return;
        }

        for (const callback of this.callbacks.get(event)!) {
            callback(params);
        }
    }
}

// code used from professor Nikolay Radoev's gitlab:
// https://gitlab.com/nikolayradoev/socket-io-exemple/-/blob/master/client/src/app/services/socket-client.service.spec.ts

describe('ClientSocketService', () => {
    let service: ClientSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ClientSocketService);
        service.socket = new SocketTestHelper() as unknown as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should disconnect', () => {
        const spy = spyOn(service.socket, 'disconnect');
        service.disconnect();
        expect(spy).toHaveBeenCalled();
    });

    it('should connect', () => {
        service.connect();
        expect(service.socket).toBeDefined();
    });

    it('isSocketAlive should return true if the socket is still connected', () => {
        service.socket.connected = true;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeTruthy();
    });

    it('isSocketAlive should return false if the socket is no longer connected', () => {
        service.socket.connected = false;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeFalsy();
    });

    it('isSocketAlive should return false if the socket is not defined', () => {
        (service.socket as unknown) = undefined;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeFalsy();
    });

    it('should call socket.on with an event', () => {
        const event = 'helloWorld';
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const action = () => {};
        const spy = spyOn(service.socket, 'on');
        service.on(event, action);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, action);
    });

    it('should call emit with data when using send', () => {
        const event = 'helloWorld';
        const data = 42;
        const emitSpy = spyOn(service.socket, 'emit');
        service.send(event, data);
        expect(emitSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith(event, data);
    });

    it('should call emit without data when using send if data is undefined', () => {
        const event = 'helloWorld';
        const data = undefined;
        const emitSpy = spyOn(service.socket, 'emit');
        service.send(event, data);
        expect(emitSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith(event);
    });
});


