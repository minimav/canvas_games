const canvas = document.querySelector('canvas')

c = canvas.getContext('2d')

const COLOURS = {
  0: 'lightgrey',
  2: 'turquoise',
  4: 'brown',
  8: 'magenta',
  16: 'yellow',
  32: 'cyan',
  64: 'green',
  128: 'orange',
  256: 'lime',
  512: 'navy',
  1024: 'pink',
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

    this.gameState = this.blankGameState()
    this.initialise()
  }

  blankGameState = () => {
    let gameState = []
    this.rowIndexes.forEach(_ => gameState.push(Array(this.numColumns).fill(0)))
    return gameState
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
    this.justAdded = location
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

  merge = (arr) => {
    return arr
  }

  shiftRight = () => {
    let gameState = this.blankGameState()
    this.rowIndexes.forEach(rowIndex => {
      const row = this.row(rowIndex)
      let nonZeroValues = row.filter(v => v > 0)
      if (nonZeroValues.length === 0) { return }

      let numZeros = this.numColumns - nonZeroValues.length
      gameState[rowIndex] = Array(numZeros).fill(0)
      gameState[rowIndex].push(...this.merge(nonZeroValues))
    })
    this.gameState = gameState
  }

  shiftLeft = () => {
    let gameState = this.blankGameState()
    this.rowIndexes.forEach(rowIndex => {
      const row = this.row(rowIndex)
      let nonZeroValues = row.filter(v => v > 0)
      if (nonZeroValues.length === 0) { return }

      let numZeros = this.numColumns - nonZeroValues.length
      gameState[rowIndex] = this.merge(nonZeroValues)
      gameState[rowIndex].push(...Array(numZeros).fill(0))
    })
    this.gameState = gameState
  }

  shiftDown = () => {
    let gameState = this.blankGameState()
    this.columnIndexes.forEach(columnIndex => {
      const column = this.column(columnIndex)
      let nonZeroValues = column.filter(v => v > 0)
      if (nonZeroValues.length === 0) { return }

      let numZeros = this.numRows - nonZeroValues.length

      let columnValues = Array(numZeros).fill(0)
      columnValues.push(...this.merge(nonZeroValues))

      this.rowIndexes.forEach(rowIndex => {
        gameState[rowIndex][columnIndex] = columnValues[rowIndex]
      })
    })
    this.gameState = gameState
  }

  shiftUp = () => {
    let gameState = this.blankGameState()
    this.columnIndexes.forEach(columnIndex => {
      const column = this.column(columnIndex)
      let nonZeroValues = column.filter(v => v > 0)
      if (nonZeroValues.length === 0) { return }

      let numZeros = this.numRows - nonZeroValues.length

      let columnValues = this.merge(nonZeroValues)
      columnValues.push(...Array(numZeros).fill(0))

      this.rowIndexes.forEach(rowIndex => {
        gameState[rowIndex][columnIndex] = columnValues[rowIndex]
      })
    })
    this.gameState = gameState
  }


}

const game = new Game2048({ numRows: 4, numColumns: 4, gap: 10, boxSize: 100 })
game.draw()


window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowRight':
      game.shiftRight()
      break
    case 'ArrowLeft':
      game.shiftLeft()
      break
    case 'ArrowUp':
      game.shiftUp()
      break
    case 'ArrowDown':
      game.shiftDown()
      break
  }
  game.addNewNumber()
  game.draw()
})
