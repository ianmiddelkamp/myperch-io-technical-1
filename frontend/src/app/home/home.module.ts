import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { TaskListComponent } from '../tasks/task-list/task-list.component';
import { DialogsModule } from '../shared/dialogs/dialogs.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HomeRoutingModule,
    DialogsModule
  ],
  declarations: [
    HomeComponent,
    TaskListComponent
  ]
})
export class HomeModule { }
