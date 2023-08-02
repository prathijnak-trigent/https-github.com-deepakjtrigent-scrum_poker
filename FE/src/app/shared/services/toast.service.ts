import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}
  public showToast(message: string): void {
    const config: MatSnackBarConfig = {
      duration: 3000,
      panelClass: ['toast'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    };

    this.snackBar.open(message, 'Close', config);
  }
}
