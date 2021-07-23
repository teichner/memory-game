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
  @Input('cardSize') cardSize: number = 150;
  @Input('frameBorder') frameBorder: number = 5;
  @Input('circleBorder') circleBorder: number = 10;
  @Input('cardSpacing') cardSpacing: number = 20;
  @Input('patternCount') patternCount: number = 10;

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
    return `translate(0, ${index * (this.cardSpacing + this.cardSize)})`;
  }

  cellTransform(index: number): string {
    return `translate(${index * (this.cardSpacing + this.cardSize)}, 0)`;
  }

  get circleX(): number {
    return this.cardSize / 2;
  }

  get circleY(): number {
    return this.cardSize / 2;
  }

  get circleRadius(): number {
    return (this.cardSize / 2) - this.frameBorder - this.circleBorder;
  }

  get frameOffset(): number {
    return this.frameBorder;
  }

  get frameSize(): number {
    return this.cardSize - (2 * this.frameBorder);
  }

  get patternSize(): number {
    return this.frameSize / this.patternCount;
  }

  get patternViewBox(): string {
    const coords = [0, 0, this.patternSize, this.patternSize];
    return coords.join(',');
  }

  get patternPercent(): string {
    const percent = 100 / this.patternCount;
    return `${percent}%`;
  }

  get patternPolygonPoints(): string {
    const size = this.patternSize;
    const points = [
      [0, size / 2],
      [size / 2, 0],
      [size, size / 2],
      [size / 2, size]
    ];
    return points.map((point) => point.join(',')).join(' ');
  }

  cardColor(card: Card): string {
    const highestValue = this.#game.cards.length / this.matchSize;
    const hue = 360 * (card.value / highestValue);
    return `hsl(${hue}, 70%, 50%)`
  }

  bodyFill(card: Card): string {
    return (card.state === CardState.FACE_UP) ? this.cardColor(card) : 'url(#diamond)';
  }

  // //TEST
  // get cardSizeCombo(): any {
  //   return {
  //     width: this.cardSize,
  //     height: this.cardSize
  //   };
  // }

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
