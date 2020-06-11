import { Node } from '../board'
import { Coordinate } from '../../game'

export default class Water extends Node {
  type: string = 'water'
  pos: Coordinate
  animator: WaterAnimation

  constructor(_pos: Coordinate) {
    super()

    this.stepMultiplier = 2
    this.pos = _pos
    this.animator = new WaterAnimation(this)
  }

  public draw(deltaTime: number, ctx: CanvasRenderingContext2D): void {
    this.animator.draw(deltaTime, ctx)
  }
}

class WaterAnimation {
  // Animation
  private animationFrame: number = 0
  private animationTime: number = 100
  
  constructor(readonly parent: Water) {
    
  }
  
  draw(deltaTime: number, ctx: CanvasRenderingContext2D) {
    if(this.parent.board == null) {
      return
    }
    
    if(this.animationFrame < this.animationTime) {
      this.animationFrame += deltaTime
      this.animationFrame = Math.min(this.animationTime, this.animationFrame)
    }
    
    const animationMultiplier = this.animationFrame / this.animationTime
    const pos = this.parent.pos
    const squareSize = this.parent.board.squareSize
    
    ctx.fillStyle = 'rgba(0, 100, 150, 0.6)'

    ctx.fillRect(
      pos.x * squareSize - ((squareSize/4) * (1-animationMultiplier)),
      pos.y * squareSize - ((squareSize/4) * (1-animationMultiplier)),
      squareSize,
      squareSize
    )
  }
}