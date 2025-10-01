import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { FundingRequestAdminResponseDto } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection?: HubConnection;
  public fundingRequestChanged$ = new Subject<FundingRequestAdminResponseDto>();

  constructor() {}

  public startConnection(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/funding-requests`, {
        accessTokenFactory: () => {
          const token = sessionStorage.getItem('loginToken');
          return token || '';
        },
        transport: HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.hubConnection
      .start()
      .then(() => {
        return this.hubConnection?.invoke('JoinAdminGroup');
      })
      .catch(err => {
        console.error('❌ Error conectando SignalR:', err);
      });

    this.hubConnection.on('FundingRequestChanged', (data: FundingRequestAdminResponseDto) => {
      this.fundingRequestChanged$.next(data);
    });

    this.hubConnection.onclose((error) => {
      console.warn('⚠️ SignalR desconectado', error);
    });

    this.hubConnection.onreconnecting((error) => {
      console.warn('🔄 Reconectando SignalR...', error);
    });

    this.hubConnection.onreconnected((connectionId) => {
      this.hubConnection?.invoke('JoinAdminGroup');
    });
  }

  public stopConnection(): void {
    this.hubConnection?.stop()
      .catch(err => console.error('Error al desconectar:', err));
  }
}
