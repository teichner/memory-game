import { Injectable } from '@angular/core';

import { Game } from './game';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private game: Game | undefined;

  constructor() { }

  initGame(args: any): Game {
    let { cardCount, matchSize } = args;
    this.game = new Game(cardCount, matchSize);
    return this.game;
  }

  getGame(): Game | undefined {
    return this.game;
  }
}
