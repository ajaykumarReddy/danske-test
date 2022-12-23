import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {
  @Input() data: any[] | null = [];
  @Input() cols: any = [];
  @Input() isActions!: boolean;

  @Output() delete = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();


}
