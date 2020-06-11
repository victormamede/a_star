import { Component } from "./components/component";
import BoardLogic from "./components/boardLogic";

export default class Controller {
  components: Component[] = []
  lastTime: number = 0

  constructor(private ctx: CanvasRenderingContext2D) {
    const board = new BoardLogic(
      {x: 26, y: 22}
    )

    ctx.canvas.width = board.size.x * board.squareSize
    ctx.canvas.height = board.size.y * board.squareSize

    ctx.canvas.addEventListener('contextmenu', (e) => { e.preventDefault() })

    ctx.canvas.addEventListener('mousemove', board.onClick.bind(board))
    ctx.canvas.addEventListener('mousedown', board.onClick.bind(board))
    

    this.addComponent(board)
  }

  addComponent(component: Component) {
    this.components.push(component)
  }

  draw(time: number) {
    const ctx = this.ctx

    const deltaTime = time-this.lastTime

    // Clear
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    this.components.forEach(component => {
      component.draw(deltaTime, ctx)
    })

    this.lastTime= time
  }
}