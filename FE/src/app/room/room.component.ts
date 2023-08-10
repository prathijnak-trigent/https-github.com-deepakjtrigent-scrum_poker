import { Component, OnDestroy } from '@angular/core';
import { cardCount } from '../shared/app-data/scrum-points-series';
import { WebsocketService } from '../shared/services/websocket.service';
import { ActivatedRoute } from '@angular/router';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnDestroy {
  public cardCounts: number[] = cardCount;
  public activeIndex: number = -1;
  public roomId!: any;
  public usersNameArray = [
    'Aaran',
    'Aaren',
    'Aarez',
    'Aarman',
    // 'Aaron',
    // 'Aaron-James',
    // 'Aarron',
    'Aaryan',
    'Aaryn',
    'Aayan',
    'Aazaan',
    'Abaan',
    // 'Abbas',
    // 'Abdallah',
    // 'Abdalroof',
    // 'Abdihakim',
    // 'Abdirahman',
    // 'Abdisalam',
    // 'Abdul',
    // 'Abdul-Aziz',
    // 'Abdulbasir',
    // 'Abdulkadir',
    // 'Abdulkarem',
    // 'Abdulkhader',
    // 'Abdullah',
    // 'Abdul-Majeed',
    // 'Abdulmalik',
    // 'Abdul-Rehman',
    // 'Abdur',
    // 'Abdurraheem',
    // 'Abdur-Rahman',
    // 'Abdur-Rehmaan',
    // 'Abel',
    // 'Abhinav',
    // 'Abhisumant',
    // 'Abid',
    // 'Abir',
    // 'Abraham',
    // 'Abu',
    // 'Abubakar',
    // 'Ace',
    'Adain',
    'Adam',
    'Adam-James',
    'Addison',
    'Addisson',
    'Adegbola',
  ];

  public selectedPoints = [1,2,3]

  constructor(
    private websocketService: WebsocketService,
    private route: ActivatedRoute
  ) {}

  public toggleActive(index: number): void {
    this.activeIndex = this.activeIndex === index ? -1 : index;
  }

  public ngOnInit(): void {
    initFlowbite();
    this.route.params.subscribe((params) => {
      this.roomId = params['roomId'];
      this.websocketService.connect(this.roomId);
    });
  }

  public ngOnDestroy(): void {
    this.websocketService.disconnect();
  }
}
