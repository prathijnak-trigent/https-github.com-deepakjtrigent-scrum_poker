import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CreateRoomService {
  constructor(private http: HttpClient) {}
  public createRoom() {
    return this.http.post('http://localhost:8000/create_room', {});
  }
}
