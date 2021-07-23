import { TestBed } from '@angular/core/testing';

// TODO: Define Card and CardPolicy ("canFaceUp" and "canFaceDown") interfaces
import { GameService } from './game.service';
import { GameState, CardState, Game } from './game';

describe('GameService', () => {
  let service: GameService;
  let game: Game;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
    game = service.initGame({
      cardCount: 6,
      matchSize: 2
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('has all expected cards', () => {
    const values = game.cards.map(({value}) => value);
    values.sort();
    expect(values).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it('handles game sequence', () => {
    const cards = game.cards;
    cards.sort((card1, card2) => card1.value - card2.value);

    expect(game.state).toBe(GameState.SELECTING);
    expect(game.activeCards).toEqual([]);

    cards[0].faceUp();
    cards[1].faceUp();
    expect(game.state).toBe(GameState.SELECTING);
    expect(game.matchedCards).toEqual([cards[0], cards[1]]);

    cards[2].faceUp();
    expect(game.state).toBe(GameState.SELECTING);
    expect(game.activeCards).toEqual([cards[2]]);

    cards[4].faceUp();
    expect(game.state).toBe(GameState.MISMATCH);
    expect(game.activeCards).toEqual([cards[2], cards[4]]);

    // expect(() => {
    //   cards[5].faceUp();
    // }).toThrowError();
    cards[5].faceUp();
    expect(cards[5].state).toBe(CardState.FACE_DOWN);


    // Expected to call card.faceDown()
    //const card2spy = spyOn(cards[2], 'faceDown');
    //const card4spy = spyOn(cards[4], 'faceDown');
    game.resetChoices();
    //expect(card2spy).toHaveBeenCalled();
    //expect(card4spy).toHaveBeenCalled();


    expect(game.state).toBe(GameState.SELECTING);
    expect(game.activeCards).toEqual([]);
    expect(game.matchedCards).toEqual([cards[0], cards[1]]);

    cards[2].faceUp();
    cards[3].faceUp();

    cards[4].faceUp();
    cards[5].faceUp();

    expect(game.matchedCards.length).toBe(cards.length);
    expect(game.state).toBe(GameState.VICTORY);
  });

  it('checks for face up', () => {
    const cards = game.cards;
    cards.sort((card1, card2) => card1.value - card2.value);

    expect(cards[0].canFaceUp()).toBeTrue();
    cards[0].faceUp();
    expect(cards[0].canFaceUp()).toBeFalse();

    cards[2].faceUp();
    expect(cards[1].canFaceUp()).toBeFalse();

    game.resetChoices();
    expect(cards[1].canFaceUp()).toBeTrue();
  });

  it('checks for face down', () => {
    const cards = game.cards;
    cards.sort((card1, card2) => card1.value - card2.value);

    cards[4].faceUp();
    cards[5].faceUp();

    expect(cards[0].canFaceDown()).toBeFalse();

    cards[0].faceUp();
    expect(cards[0].canFaceDown()).toBeFalse();

    cards[2].faceUp();

    // expect(cards[0].canFaceDown()).toBeTrue();
    expect(cards[5].canFaceDown()).toBeFalse();
  });

  it('assigns card state', () => {
    const cards = game.cards;
    cards[0].faceUp();
    expect(cards[0].state).toBe(CardState.FACE_UP);
    expect(cards[1].state).toBe(CardState.FACE_DOWN);
  });

});
