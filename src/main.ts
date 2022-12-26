import './style.css'
import { Minesweeper } from './minesweeper'

let board = new Minesweeper(document.getElementById('app'))
board.render()