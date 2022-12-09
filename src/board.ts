interface BoardOptions {
    x: number,
    y: number
}

export class Board {
    x: number
    y: number

    constructor(options: BoardOptions) {
        this.x = options.x
        this.y = options.y
    }
}