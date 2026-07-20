import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
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

// Shared across every dialog: backdrop 'static' means clicking outside the
// dialog does nothing (only Cancel/X/Escape close it), and centered
// vertically centers it instead of pinning it near the top of the viewport.
const MODAL_OPTIONS: NgbModalOptions = {
  backdrop: 'static',
  centered: true,
};

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private modalService: NgbModal) {}

  confirm(options: ConfirmOptions): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, MODAL_OPTIONS);

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
    const modalRef = this.modalService.open(EditTaskDialogComponent, MODAL_OPTIONS);

    modalRef.componentInstance.taskTitle = task.title;
    modalRef.componentInstance.taskDescription = task.description ?? '';

    return modalRef.result.then(
      (result: EditTaskDialogResult) => result,
      () => null,
    );
  }

  addTask(): Promise<EditTaskDialogResult | null> {
    const modalRef = this.modalService.open(EditTaskDialogComponent, MODAL_OPTIONS);

    modalRef.componentInstance.dialogTitle = 'Add Task';
    modalRef.componentInstance.saveLabel = 'Add';

    return modalRef.result.then(
      (result: EditTaskDialogResult) => result,
      () => null,
    );
  }
}
