import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {
  ItemsPlanningPnListsService
} from 'src/app/plugins/modules/items-planning-pn/services';
import {ItemsListPnModel} from '../../../models/list';

@Component({
  selector: 'app-items-planning-pn-list-delete',
  templateUrl: './list-delete.component.html',
  styleUrls: ['./list-delete.component.scss']
})
export class ListDeleteComponent implements OnInit {
  @ViewChild('frame', {static: false}) frame;
  @Output() onListDeleted: EventEmitter<void> = new EventEmitter<void>();
  selectedListModel: ItemsListPnModel = new ItemsListPnModel();
  constructor(private trashInspectionPnListsService: ItemsPlanningPnListsService) { }

  ngOnInit() {
  }

  show(listModel: ItemsListPnModel) {
    this.selectedListModel = listModel;
    this.frame.show();
  }

  deleteList() {
    this.trashInspectionPnListsService.deleteList(this.selectedListModel.id).subscribe((data) => {
      if (data && data.success) {
        this.onListDeleted.emit();
        this.frame.hide();
      }
    });
  }
}
