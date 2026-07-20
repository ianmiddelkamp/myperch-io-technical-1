import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { TaskListComponent } from '../tasks/task-list/task-list.component';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    HomeRoutingModule
  ],
  declarations: [
    HomeComponent,
    TaskListComponent
  ]
})
export class HomeModule { }
