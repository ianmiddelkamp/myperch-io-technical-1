import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { EditTaskDialogComponent, EditTaskDialogResult } from './edit-task-dialog/edit-task-dialog.component';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface EditableTask {
  title: string;
  description: string | null;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private modalService: NgbModal) {}

  confirm(options: ConfirmOptions): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmationDialogComponent);

    modalRef.componentInstance.title = options.title ?? 'Please confirm';
    modalRef.componentInstance.message = options.message;

    if (options.confirmLabel) {
      modalRef.componentInstance.confirmLabel = options.confirmLabel;
    }

    if (options.cancelLabel) {
      modalRef.componentInstance.cancelLabel = options.cancelLabel;
    }

    return modalRef.result.then(
      () => true,
      () => false,
    );
  }

  editTask(task: EditableTask): Promise<EditTaskDialogResult | null> {
    const modalRef = this.modalService.open(EditTaskDialogComponent);

    modalRef.componentInstance.taskTitle = task.title;
    modalRef.componentInstance.taskDescription = task.description ?? '';

    return modalRef.result.then(
      (result: EditTaskDialogResult) => result,
      () => null,
    );
  }
}
