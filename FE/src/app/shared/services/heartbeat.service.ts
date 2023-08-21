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
//   private lastActiveTime: any;
//   private heartbeatInterval: any;
//   public isTabActive: boolean = true;
//   public selectingPoints: boolean = false;
//   public userActionSend!: UserAction;
//   public heartInterval: any;

//   constructor(
//     private roomService: RoomService,
//     private router: Router,
//     private cookieService: CookieService
//   ) {
//     // this.setupVisibilityChange();
//   }

//   public setupVisibilityChange(): void {
//     window.addEventListener('focus', () => {
//       this.isTabActive = true;
//     });
//     window.addEventListener('blur', () => {
//       this.isTabActive = false;
//       this.lastActiveTime = Date.now();
//     });
//   }

//   public startHeartbeat(roomId: string, selectedPoints: boolean): void {
//     this.setupVisibilityChange()

//     let userInCookies = JSON.parse(atob(this.cookieService.get('userDetails')));
//     this.userActionSend = {
//       actionType: '',
//       userData: {
//         userId: userInCookies['userId'],
//         displayName: userInCookies['displayName'],
//       },
//     };
//     const sendHeartbeat=(roomId: string,selectedPoints: boolean):any=> {
//       console.log(this.isTabActive)
//       if (!selectedPoints && this.isTabActive) {
//         this.userActionSend['actionType'] = 'SENT_HEARTBEAT';
//       }
//       this.roomService
//         .heartBeat(roomId, this.userActionSend)
//         .subscribe((response: any) => {
//           if (response.actionType == 'USER_INACTIVE') {

//             const elapse_time = Date.now() - this.lastActiveTime;
//             console.log(elapse_time);
//             if (elapse_time > 10000) {
//               window.clearInterval(this.heartbeatInterval);
//               const confirm = window.confirm('You are inactive want to continue');
//               if (confirm) {
//                 this.lastActiveTime=Date.now()
//                 this.router.navigate([`room/${roomId}`]);
//               } else {
//                 this.router.navigate(['/']);
//                 this.startHeartbeatWithTimeout(roomId,selectedPoints)
//               }
//               console.log('no heart beat');
//             }
//           }
//           console.log(response);
//         });

//      }
//     // this.heartbeatInterval = setInterval(() => {
//     //       sendHeartbeat(roomId, selectedPoints);
//     //     }, 3000);
//     sendHeartbeat(roomId,selectedPoints)
//   }

//   public resetHeartbeatTimeout(roomId:string): void {
//     clearInterval(this.heartbeatInterval);
//     this.startHeartbeat(roomId,false)
//   }

//   public startHeartbeatWithTimeout(
//     roomId: string,
//     selectedPoints: boolean
//   ): void {
//    setInterval(() => {
//       this.startHeartbeat(roomId, selectedPoints);
//     }, 3000);
//   }
// }
