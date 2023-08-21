import { Component, OnDestroy, OnInit } from '@angular/core';
import { cardCount } from '../shared/app-data/scrum-points-series';
import { HeartbeatService } from '../shared/services/heartbeat.service';
import { WebsocketService } from '../shared/services/websocket.service';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../shared/services/room.service';
import { Router } from '@angular/router';
import { UserFormComponent } from '../user-form/user-form.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';
import { User, defaultsUser } from '../shared/model/user';
import { StorageService } from '../shared/services/storage.service';
import { v4 as uuidv4 } from 'uuid';
import { UserAction } from '../shared/model/userAction';

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
  public userData!: UserAction;

  // will be removed when api is used
  public usersNameArray = [
    'Aaran',
    'Aaren',
    'Aarez',
    'Aarman',
    'Aaryannnnnnnn',
    'Aaryn',
    'Aayan',
    'Aazaan',
    'Abaan',
    'Adain',
    'Adam',
    'Adam-James',
    'Addison',
    'Addisson',
    'Adegbola',
    'Aazaan',
    'Abaan',
    'Adain',
    'Adam',
    'Adam-James',
    'Addison',
    'Addisson',
    'Adegbola',
    'Aaryan',
    'Aaryn',
    'Aayan',
    'Aazaan',
    'Abaan',
    'Adain',
    'Adam',
    'Adam-James',
    'Addison',
    'Addisson',
    'Adegbola',
    'Aazaan',
    'Abaan',
    'Adain',
    'Adam',
    'Adam-James',
    'Addison',
    'Addisson',
    'Adegbola',
  ];

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
    private storageService: StorageService
  ) {}

  public ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.roomId = params['roomId'];
    });
    const userInCookies: string = atob(this.cookieService.get('userDetails'));
    if (userInCookies) {
      const userDetails = JSON.parse(userInCookies);
      this.userData = {
        actionType: 'STORY_POINT_SELECTION',

        userId: userDetails.userId,
        displayName: userDetails.userName,

        data: {
          storyPoint: 0,
        },
      };
    } else {
      this.openUserDialog();
    }
  }
  public ngOnDestroy(): void {
    this.websocketService.disconnect();
  }

  public update(userData: UserAction): void {
    this.roomService.updateStoryPoint(this.roomId, userData).subscribe(
      (response) => {
        console.log(response, 'this is response');
      },
      (error) => {
        this.router.navigate(['Oops']);
      }
    );
  }

  public joinRoom(userDetails: User): void {
    this.roomService.joinRoom(this.roomId, userDetails).subscribe(
      (response) => {
        // this.router.navigate([`room/${this.roomId}`]);
        this.websocketService.connect(this.roomId);
        this.heartBeat.startHeartbeat();
      },
      (error) => {
        this.router.navigate(['Oops']);
      }
    );
  }

  public toggleActive(index: number): void {
    this.activeIndex = this.activeIndex === index ? -1 : index;
    // const da=JSON.parse(atob(this.cookieService.get('userDetails')))
    // console.log(cardCount[index],da["userId"])
    // this.heartBeat.resetHeartbeatTimeout();
    // this.update(this.userData)

    // const userInCookies: string = atob(this.cookieService.get('userDetails'));
    // if (userInCookies) {
    //   const userDetails = JSON.parse(userInCookies);

    //   if (this.userData.userData.data) {
    //     this.userData.userData.data.storyPoint = cardCount[index];
    //   } else {
    //     this.userData.userData.data = { storyPoint: cardCount[index] };
    //   }

    this.roomService.updateStoryPoint(this.roomId, this.userData);
    console.log(this.userData, this.roomId, 'this is userdata and roomId');

    this.heartBeat.resetHeartbeatTimeout();
  }
  // }

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
          this.update(this.userData)
          // this.userData = {
          //   actionType: 'STORY_POINT_SELECTION',
          //   userId: this.user.userId,
          //   displayName: this.user.displayName,
          //   data: {
          //     storyPoint: 0,
          //   },
          // };

          this.joinRoom(this.user);
        }
      });
    } else {
      const userDetails = JSON.parse(userInCookies);
      this.update(this.userData)

      // this.userData = {
      //   actionType: 'STORY_POINT_SELECTION',
      //   userId: userDetails.userId,
      //   displayName: userDetails.userName,

      //   data: {
      //     storyPoint: 0,
      //   },
      // };
      this.joinRoom(userDetails);
    }
  }
}
