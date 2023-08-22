import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {
  public roomId!: string;

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
  ) {}

  public confirm(): void {
    this.dialogRef.close();
  }

  public cancel(): void {
    this.router.navigate(['/']);
    this.dialogRef.close();
  }
}
