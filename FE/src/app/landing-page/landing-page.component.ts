import { Component } from '@angular/core';
import { WebsocketService } from '../shared/services/websocket.service';
import { ToastService } from '../shared/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent {
  constructor(
    private websocketService: WebsocketService,
    private toast: ToastService,
    private router:Router
  ) {}



}
