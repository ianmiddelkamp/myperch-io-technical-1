import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export interface EditTaskDialogResult {
  title: string;
  description: string;
}

@Component({
  selector: 'app-edit-task-dialog',
  templateUrl: './edit-task-dialog.component.html',
})
export class EditTaskDialogComponent implements OnInit {
  @Input() dialogTitle = 'Edit Task';

  @Input() saveLabel = 'Save';

  @Input() taskTitle = '';

  @Input() taskDescription = '';

  editedTitle = '';

  editedDescription = '';

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.editedTitle = this.taskTitle;
    this.editedDescription = this.taskDescription;
  }

  save(): void {
    if (!this.editedTitle.trim()) {
      return;
    }

    const result: EditTaskDialogResult = {
      title: this.editedTitle.trim(),
      description: this.editedDescription.trim(),
    };

    this.activeModal.close(result);
  }
}
