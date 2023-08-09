import { Component } from '@angular/core';
import { WebsocketService } from '../shared/services/websocket.service';
import { ToastService } from '../shared/services/toast.service';
import { Router } from '@angular/router';
import { CreateRoomService } from '../shared/services/create-room.service';
import { CreateRoomResponse } from '../shared/model/roomId';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent {
  constructor(
    private websocketService: WebsocketService,
    private toast: ToastService,
    private router: Router,
    private roomservice: CreateRoomService
  ) {}

  public createRoom(): void {
    this.roomservice.createRoom().subscribe((response: CreateRoomResponse): void => {
      const roomId: string = response.room_id;
      this.router.navigate([`/room/${roomId}`]);
    });
  }
}
