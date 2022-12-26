import './style.css'
import { Minesweeper } from './minesweeper'

let board = new Minesweeper({
    container: document.getElementById('app'),
	total_bombs: 40
})


board.render()