import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {
  // public roomId!: string;

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      type: string;
      value: string;
    }
  ) {}

  public confirm(): void {
    if(this.data.type == "roomId"){
    this.router.navigate(['/room', this.data.value]);
    this.dialogRef.close();
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
