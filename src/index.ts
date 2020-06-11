import Controller from "./controller"

const canvas = <HTMLCanvasElement>document.getElementById('game-canvas')
const ctx = canvas.getContext('2d')

if(ctx != null) {
  ctx.imageSmoothingEnabled = false
  const controller = new Controller(ctx)

  const update = (time: number) => {
    controller.draw(time)
    window.requestAnimationFrame(update)
  }

  update(0)
}