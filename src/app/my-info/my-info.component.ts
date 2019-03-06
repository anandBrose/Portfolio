import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-my-info',
  templateUrl: './my-info.component.html',
  styleUrls: ['./my-info.component.scss']
})
export class MyInfoComponent implements OnInit {

  constructor() { }
  @Output() infoClick = new EventEmitter();
  ngOnInit() {
  }
  onInfoClick() {
    this.infoClick.emit();
  }
}
