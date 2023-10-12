import { Component, Input } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-server-modal',
  templateUrl: './server-modal.component.html',
})
export class ServerModalComponent {
  @Input({ required: true }) modal: NgbModalRef;
  @Input() content: unknown;
}
