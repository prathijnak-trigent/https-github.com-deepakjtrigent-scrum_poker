import { Injectable } from '@angular/core';
import { RoomService } from './room.service';
import { CookieService } from 'ngx-cookie-service';
import { UserAction } from '../model/userAction';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WebsocketService } from './websocket.service';
import { ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class HeartbeatService {
  public isTabActive: boolean = true;
  public lastActive: any;
  public heartbeatInterval: any;
  public currentTime: any;
  public subs: any;

  constructor(
    private cookieService: CookieService,
    private roomService: RoomService,
    private userDialog: MatDialog,
    private websocket: WebsocketService,
    private router: Router
  ) {}

  public setUpVisibilityChange(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isTabActive = false;
        this.lastActive = Date.now();
      } else {
        this.isTabActive = true;
      }
    });
  }

  public startHeartbeat(roomId: string): void {
    this.setUpVisibilityChange();
    let userInCookies = JSON.parse(atob(this.cookieService.get('userDetails')));
    const sendUserAction: UserAction = {
      actionType: '',
      userData: {
        userId: userInCookies.userId,
        displayName: userInCookies.displayName,
      },
    };
    if (this.isTabActive) {
      sendUserAction.actionType = 'SENT_HEARTBEAT';
    }
    this.sendHeartbeat(roomId, sendUserAction);
  }

  public sendHeartbeat = (roomId: string, sendUserAction: UserAction) => {
    this.roomService.heartBeat(roomId, sendUserAction).subscribe((response) => {
      if (response.actionType != null) {
        if (response.actionType == 'USER_INACTIVE') {
          this.currentTime = Date.now() - this.lastActive;
          if (this.currentTime > 40000) {
            clearInterval(this.heartbeatInterval);
            this.lastActive = Date.now();
            this.openConfirmDialog(roomId);
            this.websocket.disconnect();
          }
        }
      }
    });
  };

  public startwithHeartBeat(roomId: string): void {
    this.heartbeatInterval = setInterval(() => {
      this.startHeartbeat(roomId);
    }, 10000);
  }

  public resetHeartbeatTime(roomId: string): void {
    clearInterval(this.heartbeatInterval);
    this.startwithHeartBeat(roomId);
  }

  public openConfirmDialog(roomId: string): void {
    const userDialogRef: MatDialogRef<ConfirmDialogComponent> =
      this.userDialog.open(ConfirmDialogComponent, {
        data: { type: 'roomId', value: roomId },
      });
    this.router.navigate(['/']);
    userDialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
      }
    });
  }
}
