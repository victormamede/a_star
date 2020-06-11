import Board from "./board";
import { Coordinate } from "../game";
import PossibleMoves from "./possibleMoves";

export default class PathFinder {
  readonly maxStep = 100
  readonly minStep = 0
  stepInterval: number = 50

  open: PathFinderNode[] = []
  closed: PathFinderNode[] = []

  endNode: PathFinderNode | null = null
  breakAll: (() => void) | null = null
  
  possibleMoves: PossibleMoves = new PossibleMoves(<HTMLDivElement>document.getElementById('possible-moves-selector'))

  constructor(public board: Board, stepIntervalSelectorContainer: HTMLDivElement) {
    const stepIntervalSelector = document.createElement('input')
    stepIntervalSelector.type = 'range'
    stepIntervalSelector.className = 'custom-range'
    stepIntervalSelector.min = String(this.minStep)
    stepIntervalSelector.max = String(this.maxStep)
    stepIntervalSelector.value = String(this.stepInterval)
    stepIntervalSelector.addEventListener('change', (val) => {
      this.stepInterval = +(<HTMLInputElement>val.target).value
    })

    const stepIntervalLabel = document.createElement('label')
    stepIntervalLabel.innerHTML = 'Speed'

    stepIntervalLabel.appendChild(stepIntervalSelector)
    stepIntervalSelectorContainer.appendChild(stepIntervalLabel)
  }

  public start() {
    this.calculate().then(endNode => this.endNode = endNode)
  }

  public draw(deltaTime: number, ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = this.board.squareSize / 4
    ctx.lineCap = 'round'

    ctx.fillStyle = 'rgba(100, 100, 100, 0.2)'
    this.closed.forEach(node => node.drawBox(deltaTime, ctx))

    ctx.fillStyle = 'rgba(0, 32, 255, 0.2)'
    this.open.forEach(node => node.drawBox(deltaTime, ctx))

    ctx.strokeStyle = 'red'
    ctx.lineWidth = this.board.squareSize / 3
    if(this.endNode != null){
      this.endNode.drawLine(deltaTime, ctx)
    }
  }

  private async calculate(): Promise<PathFinderNode | null> {
    if(this.breakAll != null) {
      this.breakAll()
    }

    let forceBreak = false
    new Promise(resolve => this.breakAll = resolve).then(()=> { forceBreak = true })

    const [startIndex, startNode] = this.board.findStartNode()
    const [endIndex, endNode] = this.board.findEndNode()

    this.open = []
    this.closed = []
    this.endNode = null

    if(startNode == null || endNode == null) {
      return null
    }

    this.open.push(new PathFinderNode(this, startNode.pos))

    // repeat
    for(let i = 0; i < 1000; i++) {
      if(forceBreak) {
        return null
      }

      await new Promise(resolve => setTimeout(resolve, (this.maxStep-this.stepInterval)))

      const [currentNodeIndex, currentNode] = this.lowestFInOpenList(endNode.pos)
      if(currentNode == null) {
        break
      }
      
      this.closed.push(currentNode)
      this.open.splice(currentNodeIndex, 1)

      if(currentNode.pos.x === endNode.pos.x && currentNode.pos.y === endNode.pos.y) {
        return currentNode
      }

      this.possibleMoves.getDirections().forEach((direction) => {
        this.checkDirection(currentNode, direction)
      })
    }
    // ---

    this.breakAll = null
    return null
  }

  private checkDirection(currentNode: PathFinderNode, direction: Coordinate) {
    const newPos: Coordinate = { x: direction.x + currentNode.pos.x, y: direction.y + currentNode.pos.y }

    const [currentBoardNodeIndex, currentBoardNode] = this.board.getNode(newPos)

    // check if walkable
    if(currentBoardNode?.stepMultiplier === Infinity) {
      return
    }

    // check if out of bounds
    if(this.board.isOutOfBounds(newPos)) {
      return
    }

    // check if in closed list
    const inClosedList = this.inClosedList(newPos)[1]
    if(inClosedList != null) {
      return
    }

    // check if in open list
    const [inOpenListIndex, inOpenList] = this.inOpenList(newPos)
    if(inOpenList != null) {
      if(currentNode.distanceFromStart < inOpenList.distanceFromStart) {
        this.open.splice(inOpenListIndex, 1)
      }
      else {
        return
      }
    }

    const newNode = new PathFinderNode(this, newPos)
    newNode.parentNode = currentNode

    // calculate distance
    let distanceFromStart = currentNode.distanceFromStart
    if(currentBoardNode != null) {
      distanceFromStart += currentBoardNode.stepMultiplier
    }
    else {
      distanceFromStart += 1
    }

    newNode.distanceFromStart = distanceFromStart

    this.open.push(newNode)
    return newNode
  }

  private lowestFInOpenList(endPos: Coordinate): [number, PathFinderNode | undefined] {
    if(this.open.length === 0) {
      return [-1, undefined]
    }

    let lowest = 0
    let lowestF = this.open[lowest].calculateF(endPos)
    this.open.forEach((node, index) => {
      const nodeF = node.calculateF(endPos)
      if(nodeF < lowestF) {
        lowest = index
        lowestF = nodeF
      }
    })

    return [lowest, this.open[lowest]]
  }

  private inOpenList(pos: Coordinate): [number, PathFinderNode | undefined] {
    const index = this.open.findIndex(node => (node.pos.x === pos.x && node.pos.y === pos.y))
    return [index, this.open[index]]
  }
  private inClosedList(pos: Coordinate): [number, PathFinderNode | undefined] {
    const index = this.closed.findIndex(node => (node.pos.x === pos.x && node.pos.y === pos.y))
    return [index, this.closed[index]]
  }
}

class PathFinderNode {
  public distanceFromStart: number = 0
  public parentNode: PathFinderNode | null = null
  public lineDrawer: PathFinderNodeLineDrawer
  public boxDrawer: PathFinderNodeBoxDrawer

  private animationFrame = 0
  
  pos: Coordinate

  constructor(public parent: PathFinder, _pos: Coordinate){
    this.pos = {..._pos}
    
    this.lineDrawer = new PathFinderNodeLineDrawer(this)
    this.boxDrawer = new PathFinderNodeBoxDrawer(this)
  }

  public calculateF(endPos: Coordinate) {
    const distanceEstimateSquared = Math.pow(endPos.x - this.pos.x, 2) + Math.pow(endPos.y - this.pos.y, 2)
    const distanceEstimate = Math.sqrt(distanceEstimateSquared)
    return distanceEstimate + this.distanceFromStart
  }

  public drawLine(deltaTime: number, ctx: CanvasRenderingContext2D) {
    this.lineDrawer.draw(deltaTime, ctx)
  }

  public drawBox(deltaTime: number, ctx: CanvasRenderingContext2D) {
    this.boxDrawer.draw(deltaTime, ctx)
  }
}

class PathFinderNodeLineDrawer {
  animationFrame: number = 0

  constructor(public parent: PathFinderNode){
    
  }
  
  trace(deltaTime: number, ctx: CanvasRenderingContext2D) {
    if(this.parent == null) {
      return
    }
    
    if(this.parent.parentNode == null) {
      return
    }

    
    const nextPos = this.parent.parentNode.pos
    const squareSize = this.parent.parent.board.squareSize
    const animationTime = Math.max(this.parent.parent.maxStep - this.parent.parent.stepInterval, 0.01)

    this.animationFrame = Math.min(animationTime, this.animationFrame)
    const animationMultiplier = this.animationFrame / animationTime

    ctx.lineTo(
      ((1-animationMultiplier)*this.parent.pos.x + nextPos.x * animationMultiplier) * squareSize + squareSize/2, 
      ((1-animationMultiplier)*this.parent.pos.y + nextPos.y * animationMultiplier) * squareSize + squareSize/2
    )

    if(this.animationFrame < animationTime) {
      this.animationFrame += deltaTime
    }
    else{
      this.parent.parentNode.lineDrawer.trace(deltaTime, ctx)
    }

  }

  draw(deltaTime: number, ctx: CanvasRenderingContext2D) {
    const parent = this.parent.parent
    const squareSize = parent.board.squareSize

    if(this.parent.parentNode == null) {
      return
    }

    ctx.beginPath()

    ctx.moveTo(
      this.parent.pos.x * squareSize + squareSize/2, 
      this.parent.pos.y * squareSize + squareSize/2
    )

    this.parent.lineDrawer.trace(deltaTime, ctx)
    ctx.stroke()
  }
}

class PathFinderNodeBoxDrawer {
  animationFrame: number = 0
  fallDownTime: number = 100
  animationTime: number = 1000

  constructor(public parent: PathFinderNode){

  }

  draw(deltaTime: number, ctx: CanvasRenderingContext2D) {
    const squareSize = this.parent.parent.board.squareSize
    const pos = this.parent.pos

    if(this.animationFrame < this.animationTime) {
      this.animationFrame += deltaTime
      this.animationFrame = Math.min(this.animationFrame, this.animationTime)
    }

    const fallDownMultiplier = Math.min(1, this.animationFrame / this.fallDownTime)
    const animationMultiplier = this.animationFrame / this.animationTime

    ctx.fillStyle = `rgba(150, 0, 255, ${1.2-animationMultiplier}`
    ctx.fillRect(
      pos.x * squareSize - ((squareSize/4) * (1-fallDownMultiplier)),
      pos.y * squareSize - ((squareSize/4) * (1-fallDownMultiplier)),
      squareSize,
      squareSize
    )
  }
}