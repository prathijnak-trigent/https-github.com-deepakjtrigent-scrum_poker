import { Injectable } from '@angular/core';
import { RoomService } from './room.service';
import { CookieService } from 'ngx-cookie-service';
import { UserAction } from '../model/userAcion';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';
@Injectable({
  providedIn: 'root',
})
export class HeartbeatService {
  public isTabActive: boolean = true;
  public lastActive: any;
  public heartInterval: any;
  public heartbeatInterval: any;
  public roomID!: string;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private roomService: RoomService,
    private userDialog: MatDialog
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
    const userActionSend: UserAction = {
      actionType: '',
      userData: {
        userId: userInCookies['userId'],
        displayName: userInCookies['displayName'],
      },
    };
    if (this.isTabActive) {
      userActionSend.actionType = 'SENT_HEARTBEAT';
    }
    this.sendHeartbeat(roomId, userActionSend);
  }

  public sendHeartbeat = (roomId: string, userActionSend: UserAction) => {
    this.roomID = roomId;
    this.roomService.heartBeat(roomId, userActionSend).subscribe((response) => {
      if (response.actionType == 'USER_INACTIVE') {
        const currentTime = Date.now() - this.lastActive;
        console.log(currentTime);
        if (currentTime > 10000) {
          this.lastActive = Date.now();
          clearInterval(this.heartInterval);
          this.openConfirmDialog();
        }
      }
      console.log(response);
    });
  };

  public startwithHeartBeat(roomId: string): void {
    this.heartInterval = setInterval(() => {
      this.startHeartbeat(roomId);
    }, 3000);
  }

    public resetHeartbeatTimeout(roomId:string): void {
      clearInterval(this.heartInterval);
    this.startwithHeartBeat(roomId)
  }

  public openConfirmDialog(): void {
    const userDialogRef: MatDialogRef<ConfirmDialogComponent> =
      this.userDialog.open(ConfirmDialogComponent, {});
    userDialogRef.afterClosed().subscribe((result) => {});
  }
}
