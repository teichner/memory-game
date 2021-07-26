import { Input, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GameService } from '../game.service';
import { Game, Card, GameState, CardState } from '../game';
import { trigger, state, transition, style, animate, stagger, query } from '@angular/animations';

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

  #rows: Card[][] = [];

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

  @ViewChild('victoryAnimation', { read: ElementRef }) victoryAnimation?: ElementRef;

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
    this.initRows();
    this.gameService.getCardChanges()
      .subscribe(this.onCardChange.bind(this));
    this.gameService.getStateChanges()
      .subscribe(this.onStateChange.bind(this));
  }

  /*
   * If the last card picked gave us a complete match, set a timer to clear
   *  all matched cards (resetting the timer if yet another group is matched).
   */
  onCardChange(card: Card) {
    if (this.removeOnMatch && this.isFaceUp(card) && !this.#game.activeCards.length) {
      window.clearTimeout(this.#hiddenCardTimer);
      this.#hiddenCardTimer = window.setTimeout(() => {
        for (let matched of this.#game.matchedCards) {
          this.#hiddenCards.add(matched);
        }
      }, 500);
    }
  }

  /*
   * Clear the player's choices a few moments after mismatch, or triggers an
   *  animation upon victory.
   */
  onStateChange(state: GameState) {
    if (state === GameState.MISMATCH) {
      window.setTimeout(() => {
        this.#game.resetChoices();
      }, 500);
    } else if (state === GameState.VICTORY) {
      this.victoryAnimation?.nativeElement.beginElement();
    }
  }

  onCardSelect(card: Card) {
    card.faceUp();
  }

  rowTransform(index: number): string {
    return `translate(0, ${index * (this.cardSpacing + this.cardSize)})`;
  }

  cellTransform(index: number): string {
    return `translate(${index * (this.cardSpacing + this.cardSize)}, 0)`;
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

  get dashboardPosition(): number {
    return (this.cardSpacing + this.cardSize) * this.rowCount;
  }

  get dashboardVictoryPosition(): number {
    if (this.rowCount <= 1 && !this.removeOnMatch) {
      return this.dashboardPosition;
    }
    return this.dashboardPosition / 2 - 75 - this.cardSpacing;
  }

  get dashboardTransform(): string {
    const y = this.dashboardPosition;
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
  initRows() {
    const cards = this.#game.cards;
    let row;
    for (let i = 0; i < this.rowCount; i++) {
      row = [];
      for (let j = 0; j < this.columnCount; j++) {
        row.push(cards[i * this.columnCount + j]);
      }
      this.#rows.push(row);
    }
  }

  get rows() {
    return this.#rows;
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
}
