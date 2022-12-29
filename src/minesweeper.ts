export class Minesweeper {
    container: HTMLElement|null
    total_bombs: number
    rows: number
    columns: number
    board: HTMLElement|null
    first_click: boolean

    constructor(container: HTMLElement|null) {
        this.container = container
        this.total_bombs = 0
        this.rows = 0
        this.columns = 0
        this.board = null
        this.first_click = true
        
        if(container == null) {
            console.error('Something went wrong.')
            return
        }
        
        this.container?.addEventListener('contextmenu', (e) => {
            e.preventDefault()
        })

        this.initEventListeners()
    }

    createCell(x: number, y: number , is_bomb: boolean, index: string): HTMLElement {
        let cell = document.createElement('div')
        cell.classList.add('cell')
        cell.dataset.x = x.toString()
        cell.dataset.y = y.toString()
        cell.dataset.isBomb = is_bomb ? '1' : '0'
        cell.dataset.isChecked = '0'
        cell.dataset.index = index

        return cell
    }

    getAllCells(): any[] {
        return Array.from(this.getBoard().querySelectorAll(`.cell`))
    }

    getCellByXY(x: number, y: number): HTMLElement {
        return this.getBoard().querySelector(`.cell[data-x="${x}"][data-y="${y}"]`)! as HTMLElement
    }

    doesCellHaveBomb(x: number, y: number): boolean {
        let cell = this.getCellByXY(x, y)
        if(!cell) return false
        return cell.dataset.isBomb == '1' ? true : false
    }

    getBoard() {
        if(this.board) return this.board
        let board = document.createElement('div')
        board.id = 'board'
        this.board = board
        return board
    }

    getDifficulty(): string {
        let difficulty_selector = document.querySelector('.difficulty-selector') as HTMLElement
        if(difficulty_selector != null && difficulty_selector.dataset.difficulty) {
            return difficulty_selector.dataset.difficulty
        }
        return 'normal'
    }

    setDifficulty(difficulty: string|null) {
        if(!difficulty) {
            difficulty = this.getDifficulty()
        } else {
            document.querySelector<HTMLElement>('.difficulty-selector')!.dataset.difficulty = difficulty
        }
        
        switch(difficulty) {
            case 'easy':
                this.rows = 10
                this.columns = 10
                this.total_bombs = 10
                break
            case 'normal':
                this.rows = 16
                this.columns = 16
                this.total_bombs = 40
                break
            case 'hard':
                this.rows = 16
                this.columns = 30
                this.total_bombs = 99
                break
            default:
                this.rows = 16
                this.columns = 16
                this.total_bombs = 40
                break
        }

        this.resetFlagCounter()
    }

    generateBoard() {
        // console.log('generating')
        let bombs_array: number[] = []
        let cells: HTMLElement[] = []
        let index: number = 1
        let difficulty: string = this.getDifficulty()

        this.getBoard()!.className = difficulty
        
        while(bombs_array.length < this.total_bombs) {
            let random = Math.floor(Math.random() * (this.rows * this.columns)) + 1
            if(bombs_array.indexOf(random) === -1) bombs_array.push(random)
        }

        for(let i = 0; i < this.rows; i++) {
            for(let j = 0; j < this.columns; j++) {
                let cell = this.createCell(i, j, false, index.toString())
                this.appendCell(cell)
                cells.push(cell)
                index++
            }
        }
    }

    addBombs(exclude: number|null = null) {
        return new Promise(resolve => {
            // console.log('adding bombs')
            let cells = this.getAllCells()
            let bombs_array: number[] = []
            let is_bomb = false

            // console.log(this.total_bombs)
            
            while(bombs_array.length < this.total_bombs){
                let random = Math.floor(Math.random() * (this.rows * this.columns)) + 1
                if(bombs_array.indexOf(random) === -1 && random != exclude) bombs_array.push(random)
            }
    
            for(let cell of cells) {
                is_bomb = (bombs_array.indexOf(parseInt(cell.dataset.index)) > -1) ? true : false
                if(is_bomb) cell.dataset.isBomb = '1'
            }

            resolve(true)
        })
    }

    scanBoard() {
        return new Promise(resolve => {
            console.log('scanning')
    
            for(let i = 0; i < this.rows; i++) {
                for(let j = 0; j < this.columns; j++) {
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

            resolve(true)
        })
    }

    async resetBoard() {
        this.getBoard().innerHTML = ''
        this.setDifficulty(null)
        this.generateBoard()
        this.first_click = true
    }

    appendCell(cell: HTMLElement) {
        let board = this.getBoard()
        board.appendChild(cell)
    }

    render() {
        let board = this.getBoard()
        this.container?.append(board)
        this.setDifficulty(null)
        this.generateBoard()
        this.first_click = true
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
            if(x < 0 || y < 0 || x > (this.rows) || y > (this.columns)) {
                // console.log('out of bounds!')
                continue
            }

            // if there is a bomb nearby, colour it orange
            let cell = this.getCellByXY(x, y) as HTMLElement
            if(cell) {
                if(cell.dataset.isBomb === '1') {
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
        // if(this.isEveryCellChecked()) {
        //     this.winGame()
        // }

        if(!clicked_cell) return
        if(clicked_cell.dataset.isChecked === '1') return
        clicked_cell.dataset.isChecked = '1'

        if(clicked_cell.dataset.flagged == 'true') {
            this.updateFlagCounter('up')
        }

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
            if(clicked_cell.dataset.flagged == 'true') {
                clicked_cell.dataset.flagged = 'false'
                // this.updateFlagCounter('up')
            }
        }

        let { neighbour_cells, direct_neighbour_cells } = this.checkNeighbourCellsForBombs(x, y)
        clicked_cell.dataset.closeBombs
        if(clicked_cell.dataset.closeBombs === '0') {
            for(let cell of neighbour_cells) {
                clicked_cell.dataset.isChecked = '1'
                let x = cell.dataset.x
                let y = cell.dataset.y
                cell.classList.add('safe')
                if(cell.dataset.flagged == 'true') {
                    cell.dataset.flagged = 'false'
                    // this.updateFlagCounter('up')
                }
                this.leftClick(this.getCellByXY(x, y))
            }
        } else {
            for(let cell of direct_neighbour_cells) {
                if(cell.dataset.closeBombs === '0') {
                    clicked_cell.dataset.isChecked = '1'
                }
            }
        }
    }

    rightClick(cell: any): void {
        if(cell.dataset.isChecked == '1') return
        if(!cell.dataset.flagged || cell.dataset.flagged == 'false') {
            cell.dataset.flagged = 'true'
            this.updateFlagCounter('down')
        } else if(cell.dataset.flagged == 'true') {
            cell.dataset.flagged = 'false'
            this.updateFlagCounter('up')
        }
    }

    async firstClick(cell: any) {
        // console.log('first click!')
        this.setDifficulty(null)
        await this.addBombs(cell.dataset.index)
        await this.scanBoard()
        this.leftClick(cell)
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
        let flag_counter = document.getElementById('flag-counter') as HTMLElement
        if(operation == 'up') {
            flag_counter.innerHTML = (parseInt(flag_counter.innerHTML) + 1).toString()
        } else if(operation == 'down') {
            flag_counter.innerHTML = (parseInt(flag_counter.innerHTML) - 1).toString()
        }
    }

    resetFlagCounter() {
        let flag_counter = document.getElementById('flag-counter') as HTMLElement
        flag_counter.textContent = this.total_bombs.toString()
    }

    initEventListeners() {
        document.querySelector('#easy-mode')!.addEventListener('click', (e): void => {
            document.querySelector<HTMLElement>('.difficulty-selector')!.dataset.difficulty = 'easy'
            this.setDifficulty('easy')
            this.resetBoard()
        })
        document.querySelector('#normal-mode')!.addEventListener('click', (e): void => {
            document.querySelector<HTMLElement>('.difficulty-selector')!.dataset.difficulty = 'normal'
            this.setDifficulty('normal')
            this.resetBoard()
        })
        document.querySelector('#hard-mode')!.addEventListener('click', (e): void => {
            document.querySelector<HTMLElement>('.difficulty-selector')!.dataset.difficulty = 'hard'
            this.setDifficulty('hard')
            this.resetBoard()
        })
        
        let board = this.getBoard()
        board.addEventListener('mousedown', (e): void => {
            e.preventDefault()
            let target = e.target as HTMLElement
            if(target == null) return
            if(!target.classList.contains('cell')) return

            if(this.first_click) {
                this.firstClick(target)
                this.first_click = false
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