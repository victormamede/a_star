import { Component } from "./component"
import { Coordinate } from "../game"
import StartPoint from "./nodes/startpoint"
import PathFinder from "./pathFinder"


export abstract class Node {
  abstract type: string
  abstract pos: Coordinate
  public stepMultiplier: number
  public board: Board | null = null

  constructor() {
    this.stepMultiplier = Infinity
  }

  enter(_board: Board): void {
    this.board = _board
  }

  public abstract draw(deltaTime: number, ctx: CanvasRenderingContext2D): void
}

export default abstract class Board extends Component {
  boardLines: BoardLine[] = []

  nodes: Node[] = []
  pathFinder: PathFinder

  constructor(public size: Coordinate, readonly squareSize: number) {
    super()

    this.addLines()
    this.pathFinder = new PathFinder(this, <HTMLDivElement>document.getElementById('speed-selector'))
  }

  private addLines() {
    for (let x = 0; x < this.size.x + 1; x++) {
      this.boardLines.push(new BoardLine({
        x: x * this.squareSize,
        y: 0
      }, {
        x: x * this.squareSize,
        y: this.size.y * this.squareSize
      }))
    }
    for (let y = 0; y < this.size.y + 1; y++) {
      this.boardLines.push(new BoardLine({
        x: 0,
        y: y * this.squareSize,
      }, {
        x: this.size.x * this.squareSize,
        y: y * this.squareSize
      }))
    }
  }

  public addNode(node: Node) {
    const [index] = this.getNode(node.pos)
    if(index >= 0) {
      return
    }

    if(this.isOutOfBounds(node.pos)) {
      return
    }

    node.enter(this)

    this.nodes.push(node)
  }

  public getNode(pos: Coordinate): [number, Node | undefined] {
    const index = this.nodes.findIndex(node => (node.pos.x === pos.x && node.pos.y === pos.y))
    return [index, this.nodes[index]]
  }

  public isOutOfBounds(pos: Coordinate): boolean {
    return pos.x >= this.size.x || pos.x < 0 || pos.y >= this.size.y || pos.y < 0
  }

  public findStartNode(): [number, Node | undefined] {
    const index = this.nodes.findIndex(node => node.type === 'start')
    return [index, this.nodes[index]]
  }
  public findEndNode(): [number, Node | undefined] {
    const index = this.nodes.findIndex(node => node.type === 'end')
    return [index, this.nodes[index]]
  }

  draw(deltaTime: number, ctx: CanvasRenderingContext2D) {
    this.pathFinder.draw(deltaTime, ctx)
    this.boardLines.forEach(line => line.draw(deltaTime, ctx))
    this.nodes.forEach(node => node.draw(deltaTime, ctx))
  }
}

class BoardLine {
  // Animation
  private animationFrame: number = 0
  private animationTime: number = 1000

  constructor(readonly from: Coordinate, readonly to: Coordinate) {
    this.animationTime = Math.random() * 1300 + 200
  }

  draw(deltaTime: number, ctx: CanvasRenderingContext2D) {
    if(this.animationFrame < this.animationTime) {
      this.animationFrame += deltaTime
      this.animationFrame = Math.min(this.animationTime, this.animationFrame)
    }

    const animationMultiplier = this.animationFrame / this.animationTime

    // styling
    ctx.lineWidth=1
    ctx.strokeStyle=`rgba(0, 0, 0, ${animationMultiplier * 0.5})`
    ctx.beginPath()

    ctx.moveTo(this.from.x, this.from.y)
    ctx.lineTo(
      (1-animationMultiplier) * this.from.x + animationMultiplier * this.to.x,
      (1-animationMultiplier) * this.from.y + animationMultiplier * this.to.y
    )

    ctx.stroke()
  }
}