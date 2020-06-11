import { Node } from '../board'
import { Coordinate } from '../../game'

export default class Mud extends Node {
  type: string = 'mud'
  pos: Coordinate
  animator: MudAnimation

  constructor(_pos: Coordinate) {
    super()

    this.stepMultiplier = 8
    this.pos = _pos
    this.animator = new MudAnimation(this)
  }

  public draw(deltaTime: number, ctx: CanvasRenderingContext2D): void {
    this.animator.draw(deltaTime, ctx)
  }
}

class MudAnimation {
  // Animation
  private animationFrame: number = 0
  private animationTime: number = 100
  
  constructor(readonly parent: Mud) {
    
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
    
    ctx.fillStyle = 'rgba(101, 67, 42, 0.8)'

    ctx.fillRect(
      pos.x * squareSize - ((squareSize/4) * (1-animationMultiplier)),
      pos.y * squareSize - ((squareSize/4) * (1-animationMultiplier)),
      squareSize,
      squareSize
    )
  }
}