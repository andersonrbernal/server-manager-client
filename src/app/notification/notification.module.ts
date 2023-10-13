import { NgModule } from '@angular/core';
import { NotifierModule } from 'angular-notifier';
import notificationConfig from './notification.config';

@NgModule({
  declarations: [],
  imports: [NotifierModule.withConfig(notificationConfig)],
  exports: [NotifierModule]
})
export class NotificationModule { }
