import Board, { Node } from '../board'
import { Coordinate } from '../../game'

export default class StartPoint extends Node {
  type: string = 'start'
  pos: Coordinate
  animator: StartPointAnimation

  constructor(_pos: Coordinate) {
    super()

    this.stepMultiplier = 1
    this.pos = _pos
    this.animator = new StartPointAnimation(this)
  }

  enter(_board: Board) {
    this.board = _board

    // remove any other start points
    const [index] = this.board.findStartNode()
    if(index >= 0) {
      this.board.nodes.splice(index, 1)
    }
  }

  public draw(deltaTime: number, ctx: CanvasRenderingContext2D): void {
    this.animator.draw(deltaTime, ctx)
  }
}

class StartPointAnimation {
  // Animation
  private animationFrame: number = 0
  private animationTime: number = 4000
  
  constructor(readonly parent: StartPoint) {
    
  }
  
  draw(deltaTime: number, ctx: CanvasRenderingContext2D) {
    if(this.parent.board == null) {
      return
    }
    
    this.animationFrame += deltaTime
    this.animationFrame %= this.animationTime
    
    const animationMultiplier = this.animationFrame / this.animationTime
    const pos = this.parent.pos
    const squareSize = this.parent.board.squareSize
    
    ctx.fillStyle = 'green'
    ctx.lineWidth = 1
    ctx.strokeStyle = 'black'

    const posInSquareToWorld = (_pos: Coordinate): Coordinate => ({
      x: (_pos.x + pos.x) * squareSize,
      y: (_pos.y + pos.y) * squareSize
    })

    const path: Coordinate[] = [
      { x: 0.4, y: 0.8 },
      { x: 0.6, y: 0.8 },
      { x: 0.6, y: 0.2 },
      { x: 0.4, y: 0.2 },
      { x: 0.4, y: 0.25 },
      { x: 0.2 + (0.1 * Math.sin(animationMultiplier * Math.PI * 2)), y: 0.4 + (0.05 * Math.abs(Math.cos(animationMultiplier * Math.PI * 2))) },
      { x: 0.4, y: 0.55 }
    ]
    const worldPath = path.map(point => posInSquareToWorld(point))

    ctx.beginPath()
    ctx.moveTo(worldPath[0].x, worldPath[0].y)
    worldPath.forEach(point => {
      ctx.lineTo(point.x, point.y)
    })
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }
}