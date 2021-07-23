export enum CardState {
    FACE_UP,
    FACE_DOWN
}

export interface Card {
    value: number;
    state: CardState;
    faceUp(): void;
    faceDown(): void;
    canFaceUp(): boolean;
    canFaceDown(): boolean;
}

export interface CardPolicy {
    canFaceUp(card: Card): boolean;
    canFaceDown(card: Card): boolean;
    onFaceUp(card: Card): void;
    onFaceDown(card: Card): void;
}

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
    SELECTING,
    MISMATCH,
    VICTORY
}

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
        // const lastIndex = arr.length - 1;
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
        private cardCount: number,
        private matchSize: number
    ) {
        if (cardCount % matchSize !== 0) {
            throw new Error("The card count must be a multiple of the match size");
        }
        this.#cards = this.generateCards();
        this.#activeCards = [];
        this.shuffle(this.#cards);
    }

    get cards(): Card[] {
        return Array.from(this.#cards);
    }

    get activeCards(): Card[] {
        return Array.from(this.#activeCards);
    }

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

    get matchedCards(): Card[] {
        return this.#cards.filter((card) =>
            card.state === CardState.FACE_UP &&
            this.#activeCards.indexOf(card) < 0);
    }

    canFaceUp(__: Card): boolean {
        return this.state === GameState.SELECTING;
    }

    canFaceDown(card: Card): boolean {
        return this.#inReset &&
            this.#activeCards.indexOf(card) >= 0;
    }

    onFaceUp(card: Card): void {
        this.#activeCards.push(card);
        if (this.state !== GameState.MISMATCH && this.#activeCards.length === this.matchSize) {
            this.#activeCards = [];
        }
    }

    // This callback does no management of the active array, because under this policy all cards
    //  are reset at once.
    onFaceDown(__: Card): void {

    }

    resetChoices(): void {
        this.#inReset = true;
        for (let card of this.#activeCards) {
            card.faceDown();
        }
        this.#inReset = false;
        this.#activeCards = [];
    }
}
