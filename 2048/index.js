const canvas = document.querySelector('canvas')

c = canvas.getContext('2d')

const COLOURS = {
  0: 'lightgrey',
  2: 'red',
  4: 'red',
  8: 'red',
  16: 'red',
  32: 'red',
  64: 'red',
  128: 'red',
  256: 'red',
  512: 'red',
  1024: 'red',
  2048: 'red'
}

function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())];
}

class Game2048 {

  constructor({ numRows, numColumns, gap, boxSize }) {
    this.numRows = numRows
    this.numColumns = numColumns
    this.gap = gap
    this.boxSize = boxSize

    this.rowIndexes = [...Array(this.numRows).keys()]
    this.columnIndexes = [...Array(this.numColumns).keys()]

    this.gameState = []
    this.rowIndexes.forEach(_ => this.gameState.push(Array(this.numColumns).fill(0)))
    this.initialise()
  }

  column = (columnIndex) => {
    return this.rowIndexes.map(rowIndex => this.gameState[rowIndex][columnIndex])
  }

  row = (rowIndex) => this.gameState[rowIndex]

  isFinished = () => {
    return (
      this.columnIndexes.map(columnIndex => this.column(columnIndex))
        .map(column => column.some(v => v === 2048))
    )
  }

  addNewNumber = () => {
    let possibleLocations = []
    this.rowIndexes.forEach(rowIndex => {
      this.columnIndexes.forEach(columnIndex => {
        const number = this.gameState[rowIndex][columnIndex]
        if (number === 0) {
          possibleLocations.push({ rowIndex, columnIndex })
        }
      })
    })

    if (possibleLocations.length === 0) {
      // deal with game over
      return
    }

    const location = randomChoice(possibleLocations)
    this.gameState[location.rowIndex][location.columnIndex] = 2
  }

  initialise = () => {
    canvas.height = this.boxSize * this.numRows + (this.numRows + 1) * this.gap
    canvas.width = this.boxSize * this.numColumns + (this.numColumns + 1) * this.gap

    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    this.addNewNumber()
  }

  draw = () => {
    this.rowIndexes.forEach(rowIndex => {
      this.columnIndexes.forEach(columnIndex => {
        const number = this.gameState[rowIndex][columnIndex]

        // draw this square
        const colour = COLOURS[number]
        c.fillStyle = colour
        const topLeftX = this.boxSize * columnIndex + (columnIndex + 1) * this.gap
        const topLeftY = this.boxSize * rowIndex + (rowIndex + 1) * this.gap
        c.fillRect(
          topLeftX,
          topLeftY,
          this.boxSize,
          this.boxSize
        )

        // draw the number if there is one
        if (number === 0) { return }
        c.font = '48px Arial'
        c.fillStyle = 'black'
        c.textAlign = 'center'
        c.textBaseline = 'middle'
        c.fillText(number, topLeftX + this.boxSize / 2, topLeftY + this.boxSize / 2)
      })
    })
  }
}

const game = new Game2048({ numRows: 4, numColumns: 4, gap: 10, boxSize: 100 })
game.draw()
