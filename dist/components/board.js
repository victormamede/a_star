import { Component } from "./component";
import PathFinder from "./pathFinder";
export class Node {
    constructor() {
        this.board = null;
        this.stepMultiplier = Infinity;
    }
    enter(_board) {
        this.board = _board;
    }
}
export default class Board extends Component {
    constructor(size, squareSize) {
        super();
        this.size = size;
        this.squareSize = squareSize;
        this.boardLines = [];
        this.nodes = [];
        this.addLines();
        this.pathFinder = new PathFinder(this, document.getElementById('speed-selector'));
    }
    addLines() {
        for (let x = 0; x < this.size.x + 1; x++) {
            this.boardLines.push(new BoardLine({
                x: x * this.squareSize,
                y: 0
            }, {
                x: x * this.squareSize,
                y: this.size.y * this.squareSize
            }));
        }
        for (let y = 0; y < this.size.y + 1; y++) {
            this.boardLines.push(new BoardLine({
                x: 0,
                y: y * this.squareSize,
            }, {
                x: this.size.x * this.squareSize,
                y: y * this.squareSize
            }));
        }
    }
    addNode(node) {
        const [index] = this.getNode(node.pos);
        if (index >= 0) {
            return;
        }
        if (this.isOutOfBounds(node.pos)) {
            return;
        }
        node.enter(this);
        this.nodes.push(node);
    }
    getNode(pos) {
        const index = this.nodes.findIndex(node => (node.pos.x === pos.x && node.pos.y === pos.y));
        return [index, this.nodes[index]];
    }
    isOutOfBounds(pos) {
        return pos.x >= this.size.x || pos.x < 0 || pos.y >= this.size.y || pos.y < 0;
    }
    findStartNode() {
        const index = this.nodes.findIndex(node => node.type === 'start');
        return [index, this.nodes[index]];
    }
    findEndNode() {
        const index = this.nodes.findIndex(node => node.type === 'end');
        return [index, this.nodes[index]];
    }
    draw(deltaTime, ctx) {
        this.pathFinder.draw(deltaTime, ctx);
        this.boardLines.forEach(line => line.draw(deltaTime, ctx));
        this.nodes.forEach(node => node.draw(deltaTime, ctx));
    }
}
class BoardLine {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        // Animation
        this.animationFrame = 0;
        this.animationTime = 1000;
        this.animationTime = Math.random() * 1300 + 200;
    }
    draw(deltaTime, ctx) {
        if (this.animationFrame < this.animationTime) {
            this.animationFrame += deltaTime;
            this.animationFrame = Math.min(this.animationTime, this.animationFrame);
        }
        const animationMultiplier = this.animationFrame / this.animationTime;
        // styling
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(0, 0, 0, ${animationMultiplier * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo((1 - animationMultiplier) * this.from.x + animationMultiplier * this.to.x, (1 - animationMultiplier) * this.from.y + animationMultiplier * this.to.y);
        ctx.stroke();
    }
}
//# sourceMappingURL=board.js.map