/*
 * A card can be face up or face down.
 */
export enum CardState {
    FACE_UP,
    FACE_DOWN
}

/*
 * Cards drive the game's action by flipping up or down. If a card is already
 *  facing a direction, then "canFaceUp" and "canFaceDown" should return false
 *  for that same direction.
 */
export interface Card {
    value: number;
    state: CardState;
    faceUp(): void;
    faceDown(): void;
    canFaceUp(): boolean;
    canFaceDown(): boolean;
}

/*
 * A Card object may use a CardPolicy to coordinate its state with
 *  other cards or objects.
 */
export interface CardPolicy {
    canFaceUp(card: Card): boolean;
    canFaceDown(card: Card): boolean;
    onFaceUp(card: Card): void;
    onFaceDown(card: Card): void;
}

/*
 * The standard Card class makes straightforward use of a CardPolicy.
 */
export class GameCard implements Card {
    #state: CardState = CardState.FACE_DOWN;

    constructor(
        private policy: CardPolicy,
        private cardValue: number
    ) {
    }

    get value(): number {
        return this.cardValue;
    }

    get state(): CardState {
        return this.#state;
    }

    canFaceUp(): boolean {
        return this.#state === CardState.FACE_DOWN && this.policy.canFaceUp(this);
    }

    canFaceDown(): boolean {
        return this.#state === CardState.FACE_UP && this.policy.canFaceDown(this);
    }

    faceUp(): void {
        if (this.canFaceUp()) {
            this.#state = CardState.FACE_UP;
            this.policy.onFaceUp(this);
        }
    }

    faceDown(): void {
        if (this.canFaceDown()) {
            this.#state = CardState.FACE_DOWN;
            this.policy.onFaceDown(this);
        }
    }
}

export enum GameState {
    /*
     * New cards may be turned face up for matching.
     */
    SELECTING,
    /*
     * The last turned card does not match other active cards, and
     *  no further cards may be selected until one or more active
     *  cards are turned back down. (The game below resets all cards
     *  at once).
     */
    MISMATCH,
    /*
     * All cards have been matched.
     */
    VICTORY
}

/*
 * This is the standard memory game model. In addition to tracking
 *  matched and active cards, it determines whether further
 *  cards may be turned over. The model does *not* manage timer-based
 *  events on its own, so resetting the active cards and any card
 *  animation must be done externally.
 */
export class Game implements CardPolicy {
    #cards: Card[];
    #activeCards: Card[];
    #state: GameState = GameState.SELECTING;
    #inReset: boolean = false;

    private randInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    private shuffle<T>(arr: Array<T>): void {
        let randIndex;
        let temp;
        for (let i = 0; i < arr.length - 1; i++) {
            randIndex = this.randInt(i, arr.length);
            temp = arr[i];
            arr[i] = arr[randIndex];
            arr[randIndex] = temp;
        }
    }

    private generateCards(): Card[] {
        const cards: Card[] = [];
        const groupCount = this.cardCount / this.matchSize;
        for (let i = 1; i <= groupCount; i++) {
            for (let j = 0; j < this.matchSize; j++) {
                cards.push(new GameCard(this, i));
            }
        }
        return cards;
    }

    constructor(
        /*
         * Cards and their values are generated automatically by the combination
         *  of card count and number of cards per matched group.
         */
        private cardCount: number,
        private matchSize: number
    ) {
        if (matchSize && cardCount % matchSize !== 0) {
            throw new Error("The card count must be a multiple of the match size");
        }
        this.#cards = this.generateCards();
        this.#activeCards = [];
        this.shuffle(this.#cards);
    }

    /*
     * The shuffled cards.
     */
    get cards(): Card[] {
        return Array.from(this.#cards);
    }

    /*
     * The "active" cards are face-up cards not yet belonging to full-sized
     *  groups of matched cards (as determined by this.matchSize).
     */
    get activeCards(): Card[] {
        return Array.from(this.#activeCards);
    }

    /*
     * Matched cards are face-up cards already locked in to full-sized
     * groups of cards having the same value. Matched cards and active
     * cards are mutually exclusive.
     */
    get matchedCards(): Card[] {
        return this.#cards.filter((card) =>
            card.state === CardState.FACE_UP &&
            this.#activeCards.indexOf(card) < 0);
    }

    /*
     * The state is driven dynamically by other conditions rather than
     *  maintained directly.
     */
    get state(): GameState {
        if (this.matchedCards.length === this.cardCount) {
            return GameState.VICTORY;
        }
        for (let i = 0; i < this.#activeCards.length - 1; i++) {
            if (this.#activeCards[i].value !== this.#activeCards[i + 1].value) {
                return GameState.MISMATCH;
            }
        }
        return GameState.SELECTING;
    }

    /*
     * A card can turn face up only if the game is in SELECTING mode.
     */
    canFaceUp(__: Card): boolean {
        return this.state === GameState.SELECTING;
    }

    /*
     * A card can turn face down only if a special "reset" flag is
     *  toggled and the card is active. In this game, all cards
     *  are reset at once through "resetChoices".
     */
    canFaceDown(card: Card): boolean {
        return this.#inReset &&
            this.#activeCards.indexOf(card) >= 0;
    }

    /*
     * If, after turning face up, the set of active cards forms a
     *  full matched group, they are reclassified as matched cards
     *  by resetting the active card list.
     */
    onFaceUp(card: Card): void {
        this.#activeCards.push(card);
        if (this.state !== GameState.MISMATCH && this.#activeCards.length === this.matchSize) {
            this.#activeCards = [];
        }
    }

    /*
     * This callback does no management of the active array, because under this policy all cards
     *  are reset at once.
     */
    onFaceDown(__: Card): void {

    }

    /*
     * Turns all active cards face down. This is the only way to set a MISMATCH state back to
     *  SELECTING.
     */
    resetChoices(): void {
        this.#inReset = true;
        for (let card of this.#activeCards) {
            card.faceDown();
        }
        this.#inReset = false;
        this.#activeCards = [];
    }
}
