import { Component } from '@angular/core';
import { cardCount } from '../shared/app-data/scrum-points-series';
import { WebsocketService } from '../shared/services/websocket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent {
  public cardCounts: number[] = cardCount;
  public activeIndex: number = -1;
  public roomId!: string | number;

  constructor(
    private websocketService: WebsocketService,
    private router: Router
  ) {}

  private toggleActive(index: number): void {
    this.activeIndex = this.activeIndex === index ? -1 : index;
  }

  public ngOnInit(): void {
    this.roomId = this.router.url.split('/room/').join('');
    this.websocketService.connect(this.roomId);
  }

  private sendMessage(points: number): void {
    this.websocketService.send(`${points}`);
  }

  public cardClickAction(points: number, index: number): void {
    this.toggleActive(index);
    this.sendMessage(points);
  }
}
