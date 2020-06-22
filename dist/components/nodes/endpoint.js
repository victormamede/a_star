import { Node } from '../board';
export default class EndPoint extends Node {
    constructor(_pos) {
        super();
        this.type = 'end';
        this.stepMultiplier = 1;
        this.pos = _pos;
        this.animator = new EndPointAnimation(this);
    }
    enter(_board) {
        this.board = _board;
        // remove any other end points
        const [index] = this.board.findEndNode();
        if (index >= 0) {
            this.board.nodes.splice(index, 1);
        }
    }
    draw(deltaTime, ctx) {
        this.animator.draw(deltaTime, ctx);
    }
}
class EndPointAnimation {
    constructor(parent) {
        this.parent = parent;
        // Animation
        this.animationFrame = 0;
        this.animationTime = 4000;
    }
    draw(deltaTime, ctx) {
        if (this.parent.board == null) {
            return;
        }
        this.animationFrame += deltaTime;
        this.animationFrame %= this.animationTime;
        const animationMultiplier = this.animationFrame / this.animationTime;
        const pos = this.parent.pos;
        const squareSize = this.parent.board.squareSize;
        ctx.fillStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        const posInSquareToWorld = (_pos) => ({
            x: (_pos.x + pos.x) * squareSize,
            y: (_pos.y + pos.y) * squareSize
        });
        const path = [
            { x: 0.4, y: 0.8 },
            { x: 0.6, y: 0.8 },
            { x: 0.6, y: 0.2 },
            { x: 0.4, y: 0.2 },
            { x: 0.4, y: 0.25 },
            { x: 0.2 + (0.1 * Math.sin(animationMultiplier * Math.PI * 2)), y: 0.4 + (0.05 * Math.abs(Math.cos(animationMultiplier * Math.PI * 2))) },
            { x: 0.4, y: 0.55 }
        ];
        const worldPath = path.map(point => posInSquareToWorld(point));
        ctx.beginPath();
        ctx.moveTo(worldPath[0].x, worldPath[0].y);
        worldPath.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
//# sourceMappingURL=endpoint.js.map