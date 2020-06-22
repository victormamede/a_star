import { Node } from '../board';
export default class Water extends Node {
    constructor(_pos) {
        super();
        this.type = 'water';
        this.stepMultiplier = 4;
        this.pos = _pos;
        this.animator = new WaterAnimation(this);
    }
    draw(deltaTime, ctx) {
        this.animator.draw(deltaTime, ctx);
    }
}
class WaterAnimation {
    constructor(parent) {
        this.parent = parent;
        // Animation
        this.animationFrame = 0;
        this.animationTime = 100;
    }
    draw(deltaTime, ctx) {
        if (this.parent.board == null) {
            return;
        }
        if (this.animationFrame < this.animationTime) {
            this.animationFrame += deltaTime;
            this.animationFrame = Math.min(this.animationTime, this.animationFrame);
        }
        const animationMultiplier = this.animationFrame / this.animationTime;
        const pos = this.parent.pos;
        const squareSize = this.parent.board.squareSize;
        ctx.fillStyle = 'rgba(0, 100, 150, 0.6)';
        ctx.fillRect(pos.x * squareSize - ((squareSize / 4) * (1 - animationMultiplier)), pos.y * squareSize - ((squareSize / 4) * (1 - animationMultiplier)), squareSize, squareSize);
    }
}
//# sourceMappingURL=water.js.map