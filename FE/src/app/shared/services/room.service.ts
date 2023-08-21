import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateRoomResponse } from '../model/roomId';
import { scrumPokerUrls } from '../url';
import { User } from '../model/user';
import { UserAction } from '../model/userAction';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  constructor(private http: HttpClient ) {}

  public createRoom() : Observable<CreateRoomResponse> {
    return this.http.post<any>(scrumPokerUrls.createRoomUrl, {});
  }

 public joinRoom(roomId: string,user_details:User): Observable<User> {
 return this.http.post<any>(`${scrumPokerUrls.roomUrls}/${roomId}/join`,user_details)
 }

 public updateStoryPoint(roomId: string, user_data:UserAction): Observable<any> {
  console.log('esrdfg')
 return this.http.put<any>(`${scrumPokerUrls.roomUrls}/${roomId}/update`, user_data)
 }

}

