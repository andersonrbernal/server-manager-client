import { Injectable } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { NotificationMessageTypes } from '../enums/notification-message-types';
@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly notifier: NotifierService) { }

  onDefault(message: string): void {
    this.notifier.notify(NotificationMessageTypes.DEFAULT, message);
  }

  onSuccess(message: string): void {
    this.notifier.notify(NotificationMessageTypes.SUCCESS, message);
  }

  onInfo(message: string): void {
    this.notifier.notify(NotificationMessageTypes.INFO, message);
  }

  onError(message: string): void {
    this.notifier.notify(NotificationMessageTypes.ERROR, message);
  }

  onWarning(message: string): void {
    this.notifier.notify(NotificationMessageTypes.WARNING, message);
  }
}
