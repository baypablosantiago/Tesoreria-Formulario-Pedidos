import { Injectable } from '@angular/core';
import { timer } from 'rxjs';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PollingService {
  public tick$ = timer(Math.random() * 60000, 60000).pipe(share());

  constructor() {}
}
