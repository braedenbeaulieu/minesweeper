export class Cell {
    element: HTMLElement
    x: number
    y: number
    is_bomb: boolean

    constructor(x: number, y: number, is_bomb: boolean) {
        this.x = x
        this.y = y
        this.is_bomb = is_bomb
        this.element = this.createCell()

        // this.initEventListeners()
    }

    createCell() {
        let cell = document.createElement('div')
        cell.classList.add('cell')
        cell.dataset.x = this.x.toString()
        cell.dataset.y = this.y.toString()
        cell.dataset.isBomb = this.is_bomb ? '1' : '0'

        return cell
    }
}