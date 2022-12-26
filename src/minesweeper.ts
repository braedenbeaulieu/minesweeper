export class Minesweeper {
    container: HTMLElement|null
    total_bombs: number
    board: HTMLElement|null

    constructor(options: BoardOptions) {
        this.container = options.container
        this.total_bombs = options.total_bombs
        this.board = null

        this.container?.addEventListener('contextmenu', (e) => {
            e.preventDefault()
        })

        this.initEventListeners()
    }

    createCell(x: number, y: number , is_bomb: boolean): HTMLElement {
        let cell = document.createElement('div')

        //check neighbouring cells and count them
        
        cell.classList.add('cell')
        cell.dataset.x = x.toString()
        cell.dataset.y = y.toString()
        cell.dataset.isBomb = is_bomb ? '1' : '0'
        cell.dataset.isChecked = '0'

        return cell
    }

    getCellByXY(x: number, y: number) {
        return this.getBoard().querySelector(`.cell[data-x="${x}"][data-y="${y}"]`)
    }

    doesCellHaveBomb(x: number, y: number): boolean {
        let cell = this.getCellByXY(x, y)
        if(!cell) return false
        // @ts-ignore
        return cell.dataset.isBomb == '1' ? true : false
    }

    getBoard() {
        if(this.board) return this.board
        let board = document.createElement('div')
        board.id = 'board'
        this.board = board
        return board
    }

    generateBoard() {
        let bombs_array: number[] = []
        let is_bomb = false

        
        while(bombs_array.length < this.total_bombs){
            let random = Math.floor(Math.random() * (256)) + 1
            if(bombs_array.indexOf(random) === -1) bombs_array.push(random)
        }

        let cells: HTMLElement[] = []
        let x = 16
        let y = 16

        for(let i = 0; i < x; i++) {
            for(let j = 0; j < y; j++) {
                let sum = cells.length + 1
                is_bomb = (bombs_array.indexOf(sum) > -1) ? true : false
                let cell = this.createCell(i, j, is_bomb)
                this.appendCell(cell)
                cells.push(cell)
            }
        }
    }

    scanBoard() {
        console.log('scanning')
        let x = 16
        let y = 16

        for(let i = 0; i < x; i++) {
            for(let j = 0; j < y; j++) {
                let cell = this.getCellByXY(i, j)
                if(!cell) continue

                let { close_bombs } = this.checkNeighbourCellsForBombs(i, j)
                if(close_bombs > 0) {
                    // @ts-ignore
                    cell.innerHTML = `<p>${close_bombs}</p>`
                }
                // @ts-ignore
                cell.dataset.closeBombs = close_bombs
            }
        }
    }

    resetBoard() {
        this.getBoard().innerHTML = '';
        this.generateBoard()
        this.scanBoard()
    }

    appendCell(cell: HTMLElement) {
        let board = this.getBoard()
        board.appendChild(cell)
    }

    render() {
        let board = this.getBoard()
        this.container?.append(board)

        this.generateBoard()
        this.scanBoard()
    }

    checkNeighbourCellsForBombs(current_x: number, current_y: number): checkNeighbourCellsForBombsReturn {
        let cells_to_check = [
            [(current_x - 1), (current_y - 1)], [(current_x), (current_y - 1)], [(current_x + 1), (current_y - 1)],
            [(current_x - 1), (current_y)],     [(current_x), (current_y)],     [(current_x + 1), (current_y)],
            [(current_x - 1), (current_y + 1)], [(current_x), (current_y + 1)], [(current_x + 1), (current_y + 1)],
        ]
        let close_bombs = 0
        let neighbour_cells: any[] = []
        let direct_neighbour_cells: any[] = []

        for(let [x, y] of cells_to_check) {
            if(x < 0 || y < 0 || x > 15 || y > 15) {
                // console.log('out of bounds!')
                continue
            }

            // if there is a bomb nearby, colour it orange
            let cell = this.getCellByXY(x, y)
            if(cell) {
                // @ts-ignore
                if(cell.dataset.isBomb == 1) {
                    close_bombs++
                }

                if(!(x == current_x && y == current_y)) {
                    neighbour_cells.push(cell)
                }
                
                if(x == current_x || y == current_y && !(x == current_x && y == current_y)) {
                    direct_neighbour_cells.push(cell)
                }
            }
        }

        return { 
            close_bombs,
            neighbour_cells,
            direct_neighbour_cells,
        }
    }

    isEveryCellChecked(): boolean {
        if((document.querySelectorAll('.cell[data-is-checked="0"]').length) - 1 == 0) return true
        return false
    }

    leftClick(clicked_cell: any): void {
        if(this.isEveryCellChecked()) {
            this.winGame()
        }

        if(!clicked_cell) return
        if(clicked_cell.dataset.isChecked === '1') return
        clicked_cell.dataset.isChecked = '1'

        let x = parseInt(clicked_cell.dataset.x)
        let y = parseInt(clicked_cell.dataset.y)
        let is_bomb = parseInt(clicked_cell.dataset.isBomb) ? true : false

        if(is_bomb) {
            clicked_cell.classList.add('boom')
            setTimeout(() => {
                this.resetFlagCounter()
                this.loseGame()
            }, 20)
        } else {
            clicked_cell.classList.add('safe')
        }

        let { neighbour_cells, direct_neighbour_cells } = this.checkNeighbourCellsForBombs(x, y)
        clicked_cell.dataset.closeBombs
        if(clicked_cell.dataset.closeBombs === '0') {
            for(let cell of neighbour_cells) {
                clicked_cell.dataset.isChecked = '1'
                // @ts-ignore
                let x = cell.dataset.x
                // @ts-ignore
                let y = cell.dataset.y
                cell.classList.add('safe')
                this.leftClick(this.getCellByXY(x, y))
            }
        } else {
            for(let cell of direct_neighbour_cells) {
                // @ts-ignore
                if(cell.dataset.closeBombs === '0') {
                    clicked_cell.dataset.isChecked = '1'
                }
            }
        }
    }

    rightClick(cell: any): void {
        console.log('right click')
        if(!cell.dataset.flagged || cell.dataset.flagged == 'false') {
            // remove a flag from this cell
            cell.dataset.flagged = 'true'
            this.updateFlagCounter('down')
        } else if(cell.dataset.flagged == 'true') {
            // add a flag to this cell
            cell.dataset.flagged = 'false'
            this.updateFlagCounter('up')
        }
    }

    firstClick(cell: any) {
        console.log('first click!')
        console.log(cell)
    }

    loseGame() {
        alert('You lose!')
        this.resetBoard()
    }
    winGame() {
        alert('You Win!!')
        this.resetBoard()
    }

    updateFlagCounter(operation: string) {
        let flag_counter = document.getElementById('flag-counter')
        // @ts-ignore
        // console.log(flag_counter.textContent)
        if(operation == 'up') {
            // @ts-ignore
            flag_counter.innerHTML = (parseInt(flag_counter.innerHTML) + 1).toString()
        } else if(operation == 'down') {
            // @ts-ignore
            flag_counter.innerHTML = (parseInt(flag_counter.innerHTML) - 1).toString()
        }
    }

    resetFlagCounter() {
        let flag_counter = document.getElementById('flag-counter')
        // @ts-ignore
        flag_counter.textContent = '40'
    }

    initEventListeners() {
        let board = this.getBoard()
        let first_click = true

        board.addEventListener('mousedown', (e): void => {
            e.preventDefault()
            let target = e.target

            if(target == null) return
            // @ts-ignore
            if(!target.classList.contains('cell')) return

            if(first_click) {
                this.firstClick(target)
                first_click = false
            } else {
                if(e.button === 2 || (e.button === 0 && e.altKey === true)) {
                    this.rightClick(target)
                } else {
                    this.leftClick(target)
                }
            }
        })
    }
}