import BoardLogic from "./components/boardLogic";
export default class Controller {
    constructor(ctx) {
        this.ctx = ctx;
        this.components = [];
        this.lastTime = 0;
        const squareSize = 32;
        const board = new BoardLogic({ x: ctx.canvas.width / squareSize, y: ctx.canvas.height / squareSize }, squareSize);
        ctx.canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); });
        ctx.canvas.addEventListener('mousemove', board.onClick.bind(board));
        ctx.canvas.addEventListener('mousedown', board.onClick.bind(board));
        this.addComponent(board);
    }
    addComponent(component) {
        this.components.push(component);
    }
    draw(time) {
        const ctx = this.ctx;
        const deltaTime = time - this.lastTime;
        // Clear
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.components.forEach(component => {
            component.draw(deltaTime, ctx);
        });
        this.lastTime = time;
    }
}
//# sourceMappingURL=controller.js.map