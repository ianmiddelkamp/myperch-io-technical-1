import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { EditTaskDialogComponent } from './edit-task-dialog/edit-task-dialog.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [ConfirmationDialogComponent, EditTaskDialogComponent],
})
export class DialogsModule {}
