import { Component } from '@angular/core';
import { cardCount } from '../shared/app-data/scrum-points-series';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent {
  
  public cardCounts: number[] = cardCount;
  public activeIndex: number = -1;

  public toggleActive(index: number): void {
    this.activeIndex = this.activeIndex === index ? -1 : index;
  }

}
