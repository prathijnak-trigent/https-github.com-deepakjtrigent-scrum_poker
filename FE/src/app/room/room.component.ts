import { Component } from '@angular/core';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
 
})
export class RoomComponent {
 public activeIndex: number = -1;
 public card_count: number[] = [1,2,3,4,5,6,7,8,9,10]; 
  
public toggleActive(index: number): void {
    this.activeIndex = this.activeIndex === index ? -1 : index;
  }
}
