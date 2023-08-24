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
  public usersArray: {
    actionType: UserAction['actionType'];
    userData: UserData;
  }[] = [];
  public userAction!: UserAction | any;

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
          (userData.userData as UserData[]).forEach((user: UserData) => {
            this.usersArray.push({
              actionType: 'STORY_POINTS_PENDING',
              userData: user,
            });
          });
        } else if (userData.actionType === 'NEW_USER_JOINED') {
          this.usersArray.push({
            actionType: 'STORY_POINTS_PENDING',
            userData: userData.userData as UserData,
          });
        } else if (userData.actionType === 'USER_LEFT') {
          this.usersArray = this.usersArray.filter(
            (user: UserAction) =>
              (user.userData as UserData).userId !=
              (userData.userData as UserData).userId
          );
        } else if (userData.actionType === 'STORY_POINT_SELECTION') {
          this.usersArray.forEach((usersData: UserAction, index: number) => {
            if (
              (usersData.userData as UserData).userId ==
              (userData.userData as UserData).userId
            ) {
              this.usersArray[index].userData['data'] = (
                userData.userData as UserData
              ).data;

              this.usersArray[index].actionType = userData.actionType;
            }
          });
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.websocketService.disconnect();
  }

  public updateStoryPoints(storyPoints: number, index: number): void {
    this.toggleActive(index);
    this.userAction = {
      actionType: 'STORY_POINT_SELECTION',
      userData: {
        userId: this.user.userId,
        displayName: this.user.displayName,
        data: {
          storyPoints: storyPoints,
        },
      },
    };
    this.roomService.updateStoryPoint(this.roomId, this.userAction).subscribe(
      (response: UserAction) => {
        console.log(response);
        this.usersArray.forEach((usersData: UserAction, index: number) => {
          if (
            (usersData.userData as UserData).userId ==
            (response.userData as UserData).userId
          ) {
            this.usersArray[index].userData['data'] = (
              response.userData as UserData
            ).data;

            this.usersArray[index].actionType = response.actionType;
          }
        });
      },

      (error) => {
        this.toast.showToast('something went wrong', error);
      }
    );
  }
  public joinRoom(userDetails: User): void {
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
    if (!userInCookies) {
      const userDialogRef: MatDialogRef<UserFormComponent> =
        this.userDialog.open(UserFormComponent, {
          width: '400px',
        });

      userDialogRef.afterClosed().subscribe((userDisplayName: string): void => {
        if (userDisplayName) {
          this.user.userId = uuidv4();
          this.user.displayName = userDisplayName;
          this.storageService.storeUserInCookies(this.user);
          this.storageService.userDetails = this.user;
          this.joinRoom(this.user);
        }
      });
    } else {
      this.user = JSON.parse(userInCookies);

      this.joinRoom(this.user);
    }
  }
}
