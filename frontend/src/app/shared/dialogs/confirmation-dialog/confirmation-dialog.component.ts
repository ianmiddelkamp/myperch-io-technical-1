import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {
  @Input() title = 'Please confirm';

  @Input() message = 'Are you sure?';

  @Input() confirmLabel = 'Confirm';

  @Input() cancelLabel = 'Cancel';

  constructor(public activeModal: NgbActiveModal) {}
}
