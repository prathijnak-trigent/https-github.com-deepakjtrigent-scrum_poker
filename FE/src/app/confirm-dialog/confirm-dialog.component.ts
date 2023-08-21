import { Component,Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { HeartbeatService } from '../shared/services/heartbeat.service';


@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  public roomID !:string;
  constructor(private router:Router,
    private heartBeatService: HeartbeatService,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>){}

  public confirm(roomID:string):void {
   const route=this.router.url;
    this.router.navigate([`${route}`])
    this.dialogRef.close()
     this.heartBeatService.startwithHeartBeat(roomID)
  }

  public cancel():void {
    this.router.navigate(["/"])
    this.dialogRef.close()
  }

}
