import { Component, OnInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: '[card]',
  templateUrl: './card.component.svg',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  constructor(
    private elementRef: ElementRef
  ) { }

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

  ngOnInit(): void {
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


}
