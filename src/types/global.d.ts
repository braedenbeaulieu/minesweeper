export {};

declare global {
    interface Cell {
        element: HTMLElement
        x: number
        y: number
        is_bomb: boolean
    }

    interface BoardOptions {
        container: HTMLElement|null
        total_bombs: number
        // cells: Cell[]
    }

    interface checkNeighbourCellsForBombsReturn {
        close_bombs: number,
        neighbour_cells: any[]
        direct_neighbour_cells: any[]
    }
}