import { Node } from '../board';
export default class Mud extends Node {
    constructor(_pos) {
        super();
        this.type = 'mud';
        this.stepMultiplier = 8;
        this.pos = _pos;
        this.animator = new MudAnimation(this);
    }
    draw(deltaTime, ctx) {
        this.animator.draw(deltaTime, ctx);
    }
}
class MudAnimation {
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
        ctx.fillStyle = 'rgba(101, 67, 42, 0.8)';
        ctx.fillRect(pos.x * squareSize - ((squareSize / 4) * (1 - animationMultiplier)), pos.y * squareSize - ((squareSize / 4) * (1 - animationMultiplier)), squareSize, squareSize);
    }
}
//# sourceMappingURL=mud.js.map