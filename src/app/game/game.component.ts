import { Input, Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Game, Card, GameState, CardState } from '../game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.svg',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  #game: Game = this.gameService.initGame({
    cardCount: 0,
    matchSize: 0
  });

  #hiddenCards: Set<Card>;
  #hiddenCardTimer: any;

  /*
   * Together, the row and column counts determine the
   *  number of cards used in the game model.
   */
  @Input('rowCount') rowCount: number = 4;
  @Input('columnCount') columnCount: number = 6;

  /*
   * The number of cards that must match in succession
   *  to form a group.
   */
  @Input('matchSize') matchSize: number = 2;

  /*
   * If set to true, cards disappear shortly after forming
   *  matched groups.
   */
  @Input('removeOnMatch') removeOnMatch: boolean = false;

  // Presentation values
  @Input('cardSize') cardSize: number = 150;
  @Input('frameBorder') frameBorder: number = 5;
  @Input('circleBorder') circleBorder: number = 10;
  @Input('cardSpacing') cardSpacing: number = 20;
  @Input('patternCount') patternCount: number = 10;
  @Input('backFill') backFill: string = 'hsl(0, 70%, 20%)';

  constructor(
    private gameService: GameService
  ) {
    this.#hiddenCards = new Set<Card>();
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

  /*
   * Card colors are scattered across the spectrum of hues.
   */
  cardColor(card: Card): string {
    const highestValue = this.#game.cards.length / this.matchSize;
    const hue = 360 * (card.value / highestValue);
    return `hsl(${hue}, 50%, 50%)`
  }

  get dashboardTransform(): string {
    const y = (this.cardSpacing + this.cardSize) * this.rowCount;
    return `translate(0, ${y})`;
  }

  get dashboardText(): string {
    return (this.#game.state === GameState.VICTORY) ?
      "Victory!" :
      `Score: ${this.#game.matchedCards.length}`;
  }

  /*
   * Cards are organized into a table for presentation.
   */
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

  /*
   * A card must specifically be marked to be hidden, and only
   *  if "removeOnMatch" is set (see "onCardClick").
   */
  isCardHidden(card: Card): boolean {
    return this.removeOnMatch && this.#hiddenCards.has(card);
  }

  isFaceUp(card: Card): boolean {
    return card.state === CardState.FACE_UP;
  }

  /*
   * This method handles all state transitions and timed events. If possible,
   * it turns a card face up, then checks the results. If there is now a
   * mismatch, a timer is spawned to reset all active choices, giving the
   * player a moment to look at the cards. If a full match is now completed,
   * a timer is spawned to hide all matched cards (resetting if yet another
   * group is matched before time elapses).
   */
  onCardClick(card: Card): void {
    if (!card.canFaceUp()) {
      return;
    }
    const state = this.#game.state;
    card.faceUp();
    if (state !== this.#game.state && this.#game.state === GameState.MISMATCH) {
      window.setTimeout(() => {
        this.#game.resetChoices();
      }, 500);
    } else if (this.removeOnMatch && !this.#game.activeCards.length) {
      window.clearTimeout(this.#hiddenCardTimer);
      this.#hiddenCardTimer = window.setTimeout(() => {
        for (let matched of this.#game.matchedCards) {
          this.#hiddenCards.add(matched);
        }
      }, 500);
    }
  }
}
