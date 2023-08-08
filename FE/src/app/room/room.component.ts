import { Component, OnDestroy } from '@angular/core';
import { cardCount } from '../shared/app-data/scrum-points-series';
import { WebsocketService } from '../shared/services/websocket.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnDestroy {
  public cardCounts: number[] = cardCount;
  public activeIndex: number = -1;
  public roomId!: any;

  constructor(
    private websocketService: WebsocketService,
    private route: ActivatedRoute
  ) {}

  public toggleActive(index: number): void {
    this.activeIndex = this.activeIndex === index ? -1 : index;
  }

  public ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.roomId = params['roomId'];
      this.websocketService.connect(this.roomId);
    });
  }

  public ngOnDestroy(): void {
    this.websocketService.disconnect();
  }
}
