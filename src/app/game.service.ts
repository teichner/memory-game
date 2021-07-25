import { Injectable } from '@angular/core';

import { Game, Card } from './game';
import { Observable, Subject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  #game: Game | undefined;
  #stateChange: Subject<Card> = new Subject<Card>();

  constructor() { }

  initGame(args: any): Game {
    let { cardCount, matchSize } = args;
    this.#stateChange = new Subject<Card>();
    this.#game = new Game(cardCount, matchSize, (card: Card) => {
      this.#stateChange.next(card);
    });
    return this.#game;
  }

  getGame(): Game | undefined {
    return this.#game;
  }

  getStateChanges(): Observable<Card> {
    return this.#stateChange.asObservable();
  }
}
