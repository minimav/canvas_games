const canvas = document.querySelector('canvas')

c = canvas.getContext('2d')

// via https://colorbrewer2.org/#type=sequential&scheme=YlOrBr&n=9
const COLOURS = {
  0: 'lightgrey',
  2: '#ffffe5',
  4: '#fff7bc',
  8: '#fee391',
  16: '#fec44f',
  32: '#fe9929',
  64: '#ec7014',
  128: '#cc4c02',
  256: '#993404',
  512: '#662506',
  1024: '#401703',
  2048: 'white'
}

const randomChoice = (arr) => {
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
      alert("Game over!")
      window.addEventListener('keydown', keyboardEvents, false)
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
    window.addEventListener('keydown', keyboardEvents, true)
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

  static mergeRight = (arr) => {
    if (arr.length === 1) {
      // nothing to merge
      return arr
    }

    let mergedNonZeroValues = []
    let mergedPreviousPair = false
    arr.forEach((value, index) => {
      if (index === arr.length - 1) {
        if (!mergedPreviousPair) { mergedNonZeroValues.push(value) }
        return
      }

      // compare with next value
      const possibleMerge = value === arr[index + 1]
      if (possibleMerge && !mergedPreviousPair) {
        mergedNonZeroValues.push(value * 2)
        mergedPreviousPair = true
      } else if (mergedPreviousPair) {
        mergedPreviousPair = false
      } else {
        mergedNonZeroValues.push(value)
        mergedPreviousPair = false
      }
    })

    // prepend with 0s where we merged values, then supply the merged values
    let output = Array(arr.length - mergedNonZeroValues.length).fill(0)
    output.push(...mergedNonZeroValues)
    return output
  }

  static mergeLeft = (arr) => {
    // merging towards the left is the same as reversing the input,
    // merging right and then reversing the output
    return this.mergeRight(arr.reverse()).reverse()
  }

  shiftRight = () => {
    let gameState = this.blankGameState()
    this.rowIndexes.forEach(rowIndex => {
      const row = this.row(rowIndex)
      let nonZeroValues = row.filter(v => v > 0)
      if (nonZeroValues.length === 0) { return }

      let numZeros = this.numColumns - nonZeroValues.length
      gameState[rowIndex] = Array(numZeros).fill(0)
      gameState[rowIndex].push(...this.constructor.mergeRight(nonZeroValues))
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
      gameState[rowIndex] = this.constructor.mergeLeft(nonZeroValues)
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
      columnValues.push(...this.constructor.mergeRight(nonZeroValues))

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

      let columnValues = this.constructor.mergeLeft(nonZeroValues)
      columnValues.push(...Array(numZeros).fill(0))

      this.rowIndexes.forEach(rowIndex => {
        gameState[rowIndex][columnIndex] = columnValues[rowIndex]
      })
    })
    this.gameState = gameState
  }
}


const arrayEquals = (a, b) => {
  return a.every((val, index) => val === b[index])
}

const testCasesForMerging = [
  arrayEquals(Game2048.mergeLeft([2]), [2]),
  arrayEquals(Game2048.mergeRight([4]), [4]),
  arrayEquals(Game2048.mergeLeft([2, 2]), [4, 0]),
  arrayEquals(Game2048.mergeRight([2, 2]), [0, 4]),
  arrayEquals(Game2048.mergeLeft([2, 2, 8]), [4, 8, 0]),
  arrayEquals(Game2048.mergeRight([2, 2, 8]), [0, 4, 8]),
  arrayEquals(Game2048.mergeRight([2, 2, 4, 8]), [0, 4, 4, 8]),
  arrayEquals(Game2048.mergeLeft([2, 2, 4, 8]), [4, 4, 8, 0])
]
if (!testCasesForMerging.every(v => v)) {
  throw new Error("Failing test cases")
}

var game

const newGame = () => {
  game = new Game2048({ numRows: 4, numColumns: 4, gap: 10, boxSize: 100 })
  game.draw()
}

const keyboardEvents = (event) => {
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
}

newGame()


