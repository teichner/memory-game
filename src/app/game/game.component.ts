import { Input, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { GameService } from '../game.service';
import { Game, Card, GameState, CardState } from '../game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.svg',
  encapsulation: ViewEncapsulation.None
})
export class GameComponent implements OnInit {
  #game: Game = this.gameService.initGame({
    cardCount: 0,
    matchSize: 0
  });

  @Input('rowCount') rowCount: number = 4;
  @Input('columnCount') columnCount: number = 6;
  @Input('matchSize') matchSize: number = 2;

  constructor(
    private gameService: GameService
  ) {

  }

  ngOnInit(): void {
    this.#game = this.gameService.initGame({
      cardCount: this.rowCount * this.columnCount,
      matchSize: this.matchSize
    });
  }

  rowTransform(index: number): string {
    return `translate(0, ${index * 200})`;
  }

  cellTransform(index: number): string {
    return `translate(${index * 150}, 0)`;
  }

  get rows(): Card[][] {
    const rows = [];
    const cards = this.#game.cards;
    let row;
    for (let i = 0; i < this.rowCount; i++) {
      row = [];
      for (let j = 0; j < this.columnCount; j++) {
        row.push(cards[i * this.columnCount + j]);
      }
      rows.push(row);
    }
    return rows;
  }

  faceUp(card: Card): boolean {
    return card.state === CardState.FACE_UP;
  }

  onCardClick(card: Card): void {
    console.log('card clicked', card);
    const state = this.#game.state;
    card.faceUp();
    if (state !== this.#game.state && this.#game.state === GameState.MISMATCH) {
      window.setTimeout(() => {
        this.#game.resetChoices();
      }, 1000);
    }
  }

}
