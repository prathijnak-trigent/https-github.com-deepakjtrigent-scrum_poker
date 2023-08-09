import { Component, OnInit } from '@angular/core';
import { cardCount } from '../shared/app-data/scrum-points-series';
import { HeartbeatService } from '../shared/services/heartbeat.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})

export class RoomComponent implements OnInit {
  constructor(private heartBeat: HeartbeatService) {}

  ngOnInit(): void {
    this.heartBeat.startHeartbeat();
  }

  public cardCounts: number[] = cardCount;
  public activeIndex: number = -1;

  public toggleActive(index: number): void {
    this.activeIndex = this.activeIndex === index ? -1 : index;
    this.heartBeat.resetHeartbeatTimeout();
  }
}
