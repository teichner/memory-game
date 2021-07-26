import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
    Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: '[card]',
  templateUrl: './card.component.svg',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent implements OnChanges {
  #hasChanged: boolean = false;

  constructor() { }

  // TEMPORARY
  @Input('cardSize') cardSize: number = 150;
  @Input('frameBorder') frameBorder: number = 5;
  @Input('circleBorder') circleBorder: number = 10;

  @Input('color') color: string = '';
  @Input('value') value: number = 0;
  @Input('isFaceUp') isFaceUp: boolean = false;
  @Output('selected') selected = new EventEmitter<any>();

  get frameOffset(): number {
    return this.frameBorder;
  }

  get frameSize(): number {
    return this.cardSize - (2 * this.frameBorder);
  }
  // END TEMPORARY

  get rotateAnchorClasses(): any {
    return {
      'rotate-anchor': true,
      'flipped-up': this.#hasChanged && this.isFaceUp,
      'flipped-down': this.#hasChanged && !this.isFaceUp
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    const { previousValue, currentValue } = changes.isFaceUp;
    if (!!previousValue !== currentValue) {
      this.#hasChanged = true;
    }
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

  onSelect(event: any) {
    this.selected.emit(event);
  }
}
