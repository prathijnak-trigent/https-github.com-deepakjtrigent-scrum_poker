import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeartbeatService {
  private lastActiveTime = Date.now();
  private heartbeatInterval: any;
  private isTabActive = true;

  constructor() {
    this.setupVisibilityChange();
  }

  public setupVisibilityChange(): void {
    window.addEventListener('focus', () => {
      this.isTabActive = true;
    });

    window.addEventListener('blur', () => {
      this.isTabActive = false;
      this.lastActiveTime = Date.now();
    });
  }

  public startHeartbeat(): void {
    const heartbeatIntervalTime = 10000;
    const redirectAfterInactiveTime = 60000;
    const sendHeartbeat = () => {
      if (this.isTabActive) {
        console.log('No Action');
        this.lastActiveTime = Date.now();
      } else {
        const inactiveDuration = Date.now() - this.lastActiveTime;
        if (inactiveDuration > redirectAfterInactiveTime) {
          console.log('Tab is inactive for too long');
          window.clearInterval(this.heartbeatInterval);
        }
      }
    };
    this.heartbeatInterval = setInterval(sendHeartbeat, heartbeatIntervalTime);
  }

  public resetHeartbeatTimeout(): void {
    clearInterval(this.heartbeatInterval);
    this.startHeartbeat();
  }
}
