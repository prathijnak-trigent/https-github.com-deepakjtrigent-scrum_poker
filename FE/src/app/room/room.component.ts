import { Component, OnDestroy, OnInit } from '@angular/core';
import { cardCount } from '../shared/app-data/scrum-points-series';
import { HeartbeatService } from '../shared/services/heartbeat.service';
import { WebsocketService } from '../shared/services/websocket.service';
import { ActivatedRoute } from '@angular/router';
import { UserAction, UserData } from '../shared/model/userAction';
import { RoomService } from '../shared/services/room.service';
import { Router } from '@angular/router';
import { UserFormComponent } from '../user-form/user-form.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';
import { User, defaultsUser } from '../shared/model/user';
import { StorageService } from '../shared/services/storage.service';
import { v4 as uuidv4 } from 'uuid';
import { ToastService, toastState } from '../shared/services/toast.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit, OnDestroy {
  public cardCounts: number[] = cardCount;
  public activeIndex: number = -1;
  public roomId!: any;
  public user: User = defaultsUser;
  public usersArray: UserData[] = [];
  public userJobRole: string = '';
  public isDataStored!:boolean;
  // wiil be removed when gets data from backend
  public selectedPoints = [1, 2, 3];

  constructor(
    private websocketService: WebsocketService,
    private route: ActivatedRoute,
    private heartBeat: HeartbeatService,
    private roomService: RoomService,
    private router: Router,
    private cookieService: CookieService,
    private userDialog: MatDialog,
    private storageService: StorageService,
    private toast: ToastService
  ) {}

  public ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.roomId = params['roomId'];
    });

    this.openUserDialog();

    this.websocketService.recievedMessage.subscribe((message: string): void => {
      if (message) {
        const userData: UserAction = JSON.parse(message);
        if (userData.actionType === 'ACTIVE_USERS_LIST') {
          (userData.userData as UserData[]).forEach((user: any) => {
            this.usersArray.push(user);
          });

          // }
        } else if (userData.actionType === 'NEW_USER_JOINED') {
          this.usersArray.push(userData.userData as UserData);
        } else if (userData.actionType === 'USER_LEFT') {
          this.usersArray = this.usersArray.filter(
            (user: UserData) =>
              user.userId != (userData.userData as UserData).userId
          );
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.websocketService.disconnect();
  }

  public joinRoom(userDetails: User): void {
    userDetails.jobRole = this.userJobRole;
    console.log(userDetails);
    this.roomService.joinRoom(this.roomId, userDetails).subscribe(
      (response) => {
        this.websocketService.connect(this.roomId);
        this.heartBeat.startwithHeartBeat(this.roomId);
      },
      (error) => {
        this.router.navigate(['Oops']);
        this.toast.showToast(error.error.error, toastState.danger);
      }
    );
  }

  public toggleActive(index: number): void {
    this.activeIndex = this.activeIndex === index ? -1 : index;
    this.heartBeat.resetHeartbeatTime(this.roomId);
  }

  public openUserDialog(): void {
    const userInCookies: string = atob(this.cookieService.get('userDetails'));
    const jobRole=atob(this.cookieService.get('JobRole'));
    this.userJobRole=jobRole

    if (userInCookies) {
       this.isDataStored=true
    }

    if(!jobRole || !userInCookies){
      const userDialogRef: MatDialogRef<UserFormComponent> =
        this.userDialog.open(UserFormComponent, {
          data: { role: 'Job Role', img: '🙂', disable: false,displayName:this.isDataStored ? JSON.parse(userInCookies).displayName: ""},
          width: '400px',
        });

      userDialogRef.afterClosed().subscribe((response: any): void => {
        if (response.displayName) {
          this.user.userId = uuidv4();
          this.user.displayName = response.displayName;
          this.userJobRole = response.selectedJobRole;
          this.storageService.storeUserInCookies(this.user);
          this.userJobRole = response.selectedJobRole;
          this.storageService.storeJobRole(response.selectedJobRole)
          this.storageService.userDetails = this.user;
          this.joinRoom(this.user);
        }
      });
    }
 else
   this.joinRoom(JSON.parse(userInCookies));
 }
}
