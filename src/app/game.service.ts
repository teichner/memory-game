import { Injectable } from '@angular/core';

import { Game, GameState, Card } from './game';
import { Observable, Subject, of } from 'rxjs';
import {  map, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  #game: Game;
  #cardChanges: Subject<Card> = new Subject<Card>();

  constructor() {
    this.#game = new Game(0, 0);
  }

  initGame(args: any): Game {
    let { cardCount, matchSize } = args;
    this.#cardChanges = new Subject<Card>();
    this.#game = new Game(cardCount, matchSize, (card: Card) => {
      this.#cardChanges.next(card);
    });
    return this.#game;
  }

  getGame(): Game | undefined {
    return this.#game;
  }

  getCardChanges(): Observable<Card> {
    return this.#cardChanges.asObservable();
  }

  getStateChanges(): Observable<GameState> {
    return this.getCardChanges().pipe(
      map(() => this.#game.state),
      distinctUntilChanged()
      // bufferCount(2),
      // filter(([state1, state2]) => state1 !== state2),
      // map(([__, state2]) => state2)
    );
  }
}
