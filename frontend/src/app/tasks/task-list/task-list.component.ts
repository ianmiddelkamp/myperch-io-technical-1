import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DialogService } from '../../shared/dialogs/dialog.service';
import { LocalStorageService } from '../../shared/local-storage.service';
import { Task } from '../task.model';
import { TaskService } from '../task.service';

const SEARCH_DEBOUNCE_MS = 300;
const SHOW_COMPLETED_STORAGE_KEY = 'taskList.showCompleted';
const TOAST_DURATION_MS = 4000;
// Keeps the shimmer visible for at least this long, so a fast response
// doesn't just flash the row instead of being perceptible.
const MIN_ROW_LOADING_MS = 800;

interface TaskRow extends Task {
  selected: boolean;
  loading: boolean;
}

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  tasks: TaskRow[] = [];

  loading = false;

  error = '';

  toastMessage = '';

  toastType: 'success' | 'danger' = 'danger';

  searchTerm = '';

  // Default: hide completed tasks. Checking the box reveals them (shows all tasks).
  showCompleted = false;

  page = 1;

  pageSize = 10;

  total = 0;

  totalPages = 0;

  selectedCount = 0;

  anySelected = false;

  allSelectedCompleted = false;

  allSelectedIncomplete = false;

  allOnPageSelected = false;

  // True while any single-row edit or delete is in flight. Bulk actions are
  // disabled during this window to avoid a bulk operation racing/conflicting
  // with a per-row one on the same data.
  actionInProgress = false;

  private searchTimeout?: ReturnType<typeof setTimeout>;

  private toastTimeout?: ReturnType<typeof setTimeout>;

  // Fetches are triggered through this subject + switchMap so that a new
  // request (page change, filter toggle, search) cancels any in-flight one
  // instead of racing it and possibly overwriting fresh data with stale data.
  private readonly fetchTrigger$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private localStorageService: LocalStorageService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.showCompleted = this.localStorageService.getItem<boolean>(SHOW_COMPLETED_STORAGE_KEY, false);

    this.fetchTrigger$
      .pipe(
        // switchMap unsubscribes from the previous getTasks() call as soon as
        // a new one starts, so an older, still-pending request can never
        // resolve after a newer one and overwrite it with stale data.
        switchMap(() => {
          const status = this.showCompleted ? undefined : 'incomplete';
          return this.taskService.getTasks(this.page, this.pageSize, this.searchTerm, status);
        }),
      )
      .subscribe({
        next: response => {
          this.tasks = response.data.map(task => ({ ...task, selected: false, loading: false }));
          this.total = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.loading = false;
          this.updateSelectionState();
        },
        error: () => {
          this.error = 'Failed to load tasks.';
          this.loading = false;
        },
      });

    this.fetchTasks();
  }

  fetchTasks(): void {
    this.loading = true;
    this.error = '';
    this.fetchTrigger$.next();
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.fetchTasks();
    }, SEARCH_DEBOUNCE_MS);
  }

  clearSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTerm = '';
    this.page = 1;
    this.fetchTasks();
  }

  onShowCompletedChange(showCompleted: boolean): void {
    if (showCompleted === this.showCompleted) {
      return;
    }

    this.showCompleted = showCompleted;
    this.localStorageService.setItem(SHOW_COMPLETED_STORAGE_KEY, showCompleted);
    this.page = 1;
    this.fetchTasks();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.page = page;
    this.fetchTasks();
  }

  toggleSelection(task: TaskRow): void {
    task.selected = !task.selected;
    this.updateSelectionState();
  }

  toggleSelectAll(checked: boolean): void {
    this.tasks.forEach(task => {
      task.selected = checked;
    });
    this.updateSelectionState();
  }

  async onAddTask(): Promise<void> {
    const result = await this.dialogService.addTask();

    if (!result) {
      return;
    }

    this.taskService.createTask(result.title, result.description).subscribe({
      next: () => {
        this.showToast('Task added.', 'success');
        this.fetchTasks();
      },
      error: (err: HttpErrorResponse) => {
        this.showToast(err.error?.message || 'Failed to add task.', 'danger');
      },
    });
  }

  showToast(message: string, type: 'success' | 'danger' = 'danger'): void {
    clearTimeout(this.toastTimeout);
    this.toastMessage = message;
    this.toastType = type;
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
    }, TOAST_DURATION_MS);
  }

  async onEditTask(task: TaskRow): Promise<void> {
    // Copy so the dialog's initial values can't end up referencing (and the
    // dialog's internal state can't accidentally mutate) the row still shown
    // in the table while the user is editing.
    const taskCopy = { ...task };
    const result = await this.dialogService.editTask(taskCopy);

    if (!result) {
      return;
    }

    task.loading = true;
    this.actionInProgress = true;
    const startedAt = Date.now();

    this.taskService.updateTask(task.id, { title: result.title, description: result.description }).subscribe({
      next: updated => {
        this.finishRowAction(startedAt, () => {
          // Replace in place instead of refetching the whole list, so
          // editing one row doesn't reset/refresh everything else on screen.
          task.title = updated.title;
          task.description = updated.description;
          task.completed = updated.completed;
          task.updatedAt = updated.updatedAt;
          task.loading = false;
          this.showToast('Task updated.', 'success');
        });
      },
      error: (err: HttpErrorResponse) => {
        this.finishRowAction(startedAt, () => {
          task.loading = false;
          this.showToast(err.error?.message || 'Failed to update task.', 'danger');
        });
      },
    });
  }

  async onDeleteTask(task: TaskRow): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Delete task',
      message: `Delete "${task.title}"? This cannot be undone.`,
      confirmLabel: 'Delete',
    });

    if (!confirmed) {
      return;
    }

    task.loading = true;
    this.actionInProgress = true;

    // TODO: delete task. Wrap the actual DELETE call the same way onEditTask
    // wraps its PATCH: task.loading/this.actionInProgress reset to false via
    // finishRowAction() once the request settles.
    task.loading = false;
    this.actionInProgress = false;
  }

  onToggleComplete(task: Task): void {
    // TODO: PATCH task completed status
  }

  async onBulkMarkComplete(): Promise<void> {
    await this.bulkUpdateStatus(true, 'Mark Complete');
  }

  async onBulkMarkIncomplete(): Promise<void> {
    await this.bulkUpdateStatus(false, 'Mark Incomplete');
  }

  async onBulkDelete(): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Delete tasks',
      message: `Delete ${this.selectedCount} selected task(s)? This cannot be undone.`,
      confirmLabel: 'Delete',
    });

    if (!confirmed) {
      return;
    }

    // TODO: bulk delete
  }

  private async bulkUpdateStatus(completed: boolean, confirmLabel: string): Promise<void> {
    const selectedTasks = this.tasks.filter(task => task.selected);

    const confirmed = await this.dialogService.confirm({
      message: `Mark ${selectedTasks.length} selected task(s) as ${completed ? 'complete' : 'incomplete'}?`,
      confirmLabel,
    });

    if (!confirmed) {
      return;
    }

    selectedTasks.forEach(task => {
      task.loading = true;
    });
    this.actionInProgress = true;
    const startedAt = Date.now();
    const ids = selectedTasks.map(task => task.id);

    this.taskService.bulkUpdateStatus(ids, completed).subscribe({
      next: updatedTasks => {
        this.finishRowAction(startedAt, () => {
          // Replace in place instead of refetching, same as onEditTask, so
          // a bulk action doesn't reset/reload everything else on screen.
          const updatedById = new Map(updatedTasks.map(task => [task.id, task]));

          selectedTasks.forEach(task => {
            const updated = updatedById.get(task.id);

            if (updated) {
              task.completed = updated.completed;
              task.updatedAt = updated.updatedAt;
            }

            task.loading = false;
            task.selected = false;
          });

          this.updateSelectionState();
          this.showToast(`${selectedTasks.length} task(s) marked ${completed ? 'complete' : 'incomplete'}.`, 'success');
          this.fetchTrigger$.next(); // refresh the list to update the "completed" filter if needed
        });
      },
      error: (err: HttpErrorResponse) => {
        this.finishRowAction(startedAt, () => {
          selectedTasks.forEach(task => {
            task.loading = false;
          });
          this.showToast(err.error?.message || 'Failed to update tasks.', 'danger');
        });
      },
    });
  }

  // Applies a row-action's result (success or error) after waiting out
  // whatever's left of MIN_ROW_LOADING_MS, so the shimmer never just flashes
  // for a request that resolves faster than a human can perceive. Also
  // clears actionInProgress, re-enabling the bulk action buttons.
  private finishRowAction(startedAt: number, apply: () => void): void {
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(MIN_ROW_LOADING_MS - elapsed, 0);

    setTimeout(() => {
      apply();
      this.actionInProgress = false;
    }, remaining);
  }

  private updateSelectionState(): void {
    const selectedTasks = this.tasks.filter(task => task.selected);

    this.selectedCount = selectedTasks.length;
    this.anySelected = selectedTasks.length > 0;
    this.allSelectedCompleted = this.anySelected && selectedTasks.every(task => task.completed);
    this.allSelectedIncomplete = this.anySelected && selectedTasks.every(task => !task.completed);
    this.allOnPageSelected = this.tasks.length > 0 && this.tasks.every(task => task.selected);
  }
}
