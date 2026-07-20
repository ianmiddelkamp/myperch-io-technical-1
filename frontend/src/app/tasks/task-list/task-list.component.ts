import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../../shared/local-storage.service';
import { Task } from '../task.model';
import { TaskService } from '../task.service';

const SEARCH_DEBOUNCE_MS = 300;
const SHOW_COMPLETED_STORAGE_KEY = 'taskList.showCompleted';

interface TaskRow extends Task {
  selected: boolean;
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

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private taskService: TaskService,
    private localStorageService: LocalStorageService,
  ) {}

  ngOnInit(): void {
    this.showCompleted = this.localStorageService.getItem<boolean>(SHOW_COMPLETED_STORAGE_KEY, false);
    this.fetchTasks();
  }

  fetchTasks(): void {
    this.loading = true;
    this.error = '';

    const status = this.showCompleted ? undefined : 'incomplete';

    this.taskService.getTasks(this.page, this.pageSize, this.searchTerm, status).subscribe({
      next: response => {
        this.tasks = response.data.map(task => ({ ...task, selected: false }));
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

  onAddTask(): void {
    // TODO: open add-task form
  }

  onEditTask(task: Task): void {
    // TODO: open edit-task form
  }

  onDeleteTask(task: Task): void {
    // TODO: delete task
  }

  onToggleComplete(task: Task): void {
    // TODO: PATCH task completed status
  }

  onBulkMarkComplete(): void {
    // TODO: bulk mark complete
  }

  onBulkMarkIncomplete(): void {
    // TODO: bulk mark incomplete
  }

  onBulkDelete(): void {
    // TODO: bulk delete
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
