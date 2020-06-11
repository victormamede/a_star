import { Coordinate } from "../game";

export default class PossibleMoves {
  canvas: HTMLCanvasElement
  drawer: PossibleMovesDrawer

  directions = [
    [true, true, true],
    [true, false, true],
    [true, true, true]
  ]

  readonly squareSize = 40

  constructor(containter: HTMLDivElement) {
    const canvas = <HTMLCanvasElement>document.createElement('canvas')
    canvas.width = this.squareSize * 3
    canvas.height = this.squareSize * 3

    containter.appendChild(canvas)
    canvas.addEventListener('mousedown', this.onClick.bind(this))

    this.canvas = canvas

    this.drawer = new PossibleMovesDrawer(this)
    this.drawer.draw()
  }

  onClick(e: MouseEvent) {
    const square = {
      x: Math.floor(e.offsetX / this.squareSize),
      y: Math.floor(e.offsetY / this.squareSize)
    }

    if(square.x === 1 && square.y === 1) { 
      return
    }

    this.directions[square.y][square.x] = !this.directions[square.y][square.x]
    this.drawer.draw()
    console.log(this)
  }

  getDirections(): { pos: Coordinate, weight: number }[] {
    let toReturn: { pos: Coordinate, weight: number }[] = []

    for(let x = 0; x < 3; x++) {
      for(let y = 0; y < 3; y++) {
        if(this.directions[y][x]) {
          const pos = {
            x: x - 1,
            y: y - 1
          }

          const weight = Math.sqrt(pos.x * pos.x + pos.y * pos.y)

          toReturn.push({
            pos: pos,
            weight: weight
          })
        }
      }
    }

    console.log(toReturn)
    return toReturn
  }
}

class PossibleMovesDrawer {
  ctx: CanvasRenderingContext2D

  constructor(private parent: PossibleMoves) {
    this.ctx = <CanvasRenderingContext2D>parent.canvas.getContext('2d')
  }

  draw() {
    const ctx = this.ctx

    // clear
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // lines
    ctx.beginPath()
    ctx.strokeStyle='black'
    ctx.lineWidth = 1
    for(let x = 0; x < 4; x++) {
      ctx.moveTo(x * this.parent.squareSize, 0)
      ctx.lineTo(x * this.parent.squareSize, ctx.canvas.height)
    }
    for(let y = 0; y < 4; y++) {
      ctx.moveTo(0, y * this.parent.squareSize)
      ctx.lineTo(ctx.canvas.width, y * this.parent.squareSize)
    }
    ctx.stroke()

    ctx.fillStyle = 'blue'
    ctx.beginPath()
    ctx.arc(ctx.canvas.width/2, ctx.canvas.height/2, this.parent.squareSize/3, 0, 360)
    ctx.fill()

    this.parent.getDirections().forEach(direction => {
      const pos = {
        x: ctx.canvas.width/2 + direction.pos.x * this.parent.squareSize,
        y: ctx.canvas.height/2 + direction.pos.y * this.parent.squareSize
      }

      ctx.fillStyle = 'red'
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, this.parent.squareSize/4, 0, 360)
      ctx.fill()
    })
  }
}