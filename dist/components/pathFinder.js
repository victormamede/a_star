var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import PossibleMoves from "./possibleMoves";
export default class PathFinder {
    constructor(board, stepIntervalSelectorContainer) {
        this.board = board;
        this.maxStep = 100;
        this.minStep = 0;
        this.stepInterval = 50;
        this.open = [];
        this.closed = [];
        this.endNode = null;
        this.breakAll = null;
        this.possibleMoves = new PossibleMoves(document.getElementById('possible-moves-selector'));
        const stepIntervalSelector = document.createElement('input');
        stepIntervalSelector.type = 'range';
        stepIntervalSelector.className = 'custom-range';
        stepIntervalSelector.min = String(this.minStep);
        stepIntervalSelector.max = String(this.maxStep);
        stepIntervalSelector.value = String(this.stepInterval);
        stepIntervalSelector.addEventListener('change', (val) => {
            this.stepInterval = +val.target.value;
        });
        const stepIntervalLabel = document.createElement('label');
        stepIntervalLabel.innerHTML = 'Speed';
        stepIntervalLabel.appendChild(stepIntervalSelector);
        stepIntervalSelectorContainer.appendChild(stepIntervalLabel);
    }
    start() {
        this.calculate().then(endNode => this.endNode = endNode);
    }
    draw(deltaTime, ctx) {
        ctx.lineWidth = this.board.squareSize / 4;
        ctx.lineCap = 'round';
        this.closed.forEach(node => node.drawBox(deltaTime, ctx, { r: 100, g: 100, b: 100 }));
        this.open.forEach(node => node.drawBox(deltaTime, ctx, { r: 150, g: 0, b: 255 }));
        ctx.strokeStyle = 'red';
        ctx.lineWidth = this.board.squareSize / 3;
        if (this.endNode != null) {
            this.endNode.drawLine(deltaTime, ctx);
        }
    }
    calculate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.breakAll != null) {
                this.breakAll();
            }
            let forceBreak = false;
            new Promise(resolve => this.breakAll = resolve).then(() => { forceBreak = true; });
            const [startIndex, startNode] = this.board.findStartNode();
            const [endIndex, endNode] = this.board.findEndNode();
            this.open = [];
            this.closed = [];
            this.endNode = null;
            if (startNode == null || endNode == null) {
                return null;
            }
            this.open.push(new PathFinderNode(this, startNode.pos));
            // repeat
            for (let i = 0; i < 1000; i++) {
                if (forceBreak) {
                    return null;
                }
                yield new Promise(resolve => setTimeout(resolve, (this.maxStep - this.stepInterval)));
                const [currentNodeIndex, currentNode] = this.lowestFInOpenList(endNode.pos);
                if (currentNode == null) {
                    break;
                }
                this.closed.push(currentNode);
                this.open.splice(currentNodeIndex, 1);
                if (currentNode.pos.x === endNode.pos.x && currentNode.pos.y === endNode.pos.y) {
                    return currentNode;
                }
                this.possibleMoves.getDirections().forEach((direction) => {
                    this.checkDirection(currentNode, direction);
                });
            }
            // ---
            this.breakAll = null;
            return null;
        });
    }
    checkDirection(currentNode, direction) {
        var _a;
        const newPos = { x: direction.pos.x + currentNode.pos.x, y: direction.pos.y + currentNode.pos.y };
        const [currentBoardNodeIndex, currentBoardNode] = this.board.getNode(newPos);
        // check if walkable
        if (((_a = currentBoardNode) === null || _a === void 0 ? void 0 : _a.stepMultiplier) === Infinity) {
            return;
        }
        // check if out of bounds
        if (this.board.isOutOfBounds(newPos)) {
            return;
        }
        // check if in closed list
        const inClosedList = this.inClosedList(newPos)[1];
        if (inClosedList != null) {
            return;
        }
        const newNode = new PathFinderNode(this, newPos);
        newNode.parentNode = currentNode;
        // calculate distance
        let distanceFromStart = currentNode.distanceFromStart;
        let stepWeight = direction.weight;
        if (currentBoardNode != null) {
            stepWeight *= currentBoardNode.stepMultiplier;
        }
        distanceFromStart += stepWeight;
        newNode.distanceFromStart = distanceFromStart;
        // check if in open list
        const [inOpenListIndex, inOpenList] = this.inOpenList(newPos);
        if (inOpenList != null) {
            if (newNode.distanceFromStart < inOpenList.distanceFromStart) {
                this.open.splice(inOpenListIndex, 1);
            }
            else {
                return;
            }
        }
        this.open.push(newNode);
        return newNode;
    }
    lowestFInOpenList(endPos) {
        if (this.open.length === 0) {
            return [-1, undefined];
        }
        let lowest = 0;
        let lowestF = this.open[lowest].calculateF(endPos);
        this.open.forEach((node, index) => {
            const nodeF = node.calculateF(endPos);
            if (nodeF < lowestF) {
                lowest = index;
                lowestF = nodeF;
            }
        });
        return [lowest, this.open[lowest]];
    }
    inOpenList(pos) {
        const index = this.open.findIndex(node => (node.pos.x === pos.x && node.pos.y === pos.y));
        return [index, this.open[index]];
    }
    inClosedList(pos) {
        const index = this.closed.findIndex(node => (node.pos.x === pos.x && node.pos.y === pos.y));
        return [index, this.closed[index]];
    }
}
class PathFinderNode {
    constructor(parent, _pos) {
        this.parent = parent;
        this.distanceFromStart = 0;
        this.parentNode = null;
        this.animationFrame = 0;
        this.pos = Object.assign({}, _pos);
        this.lineDrawer = new PathFinderNodeLineDrawer(this);
        this.boxDrawer = new PathFinderNodeBoxDrawer(this);
    }
    calculateF(endPos) {
        const distanceVector = {
            x: (endPos.x - this.pos.x),
            y: (endPos.y - this.pos.y)
        };
        const distanceEstimateSquared = distanceVector.x * distanceVector.x + distanceVector.y * distanceVector.y;
        const distanceEstimate = Math.sqrt(distanceEstimateSquared);
        return this.distanceFromStart + distanceEstimate;
    }
    drawLine(deltaTime, ctx) {
        this.lineDrawer.draw(deltaTime, ctx);
    }
    drawBox(deltaTime, ctx, color) {
        this.boxDrawer.draw(deltaTime, ctx, color);
    }
}
class PathFinderNodeLineDrawer {
    constructor(parent) {
        this.parent = parent;
        this.animationFrame = 0;
    }
    trace(deltaTime, ctx) {
        if (this.parent == null) {
            return;
        }
        if (this.parent.parentNode == null) {
            return;
        }
        const nextPos = this.parent.parentNode.pos;
        const squareSize = this.parent.parent.board.squareSize;
        const animationTime = Math.max(this.parent.parent.maxStep - this.parent.parent.stepInterval, 0.01);
        this.animationFrame = Math.min(animationTime, this.animationFrame);
        const animationMultiplier = this.animationFrame / animationTime;
        ctx.lineTo(((1 - animationMultiplier) * this.parent.pos.x + nextPos.x * animationMultiplier) * squareSize + squareSize / 2, ((1 - animationMultiplier) * this.parent.pos.y + nextPos.y * animationMultiplier) * squareSize + squareSize / 2);
        if (this.animationFrame < animationTime) {
            this.animationFrame += deltaTime;
        }
        else {
            this.parent.parentNode.lineDrawer.trace(deltaTime, ctx);
        }
    }
    draw(deltaTime, ctx) {
        const parent = this.parent.parent;
        const squareSize = parent.board.squareSize;
        if (this.parent.parentNode == null) {
            return;
        }
        ctx.beginPath();
        ctx.moveTo(this.parent.pos.x * squareSize + squareSize / 2, this.parent.pos.y * squareSize + squareSize / 2);
        this.parent.lineDrawer.trace(deltaTime, ctx);
        ctx.stroke();
    }
}
class PathFinderNodeBoxDrawer {
    constructor(parent) {
        this.parent = parent;
        this.animationFrame = 0;
        this.fallDownTime = 100;
        this.animationTime = 1000;
    }
    draw(deltaTime, ctx, color) {
        const squareSize = this.parent.parent.board.squareSize;
        const pos = this.parent.pos;
        if (this.animationFrame < this.animationTime) {
            this.animationFrame += deltaTime;
            this.animationFrame = Math.min(this.animationFrame, this.animationTime);
        }
        const fallDownMultiplier = Math.min(1, this.animationFrame / this.fallDownTime);
        const animationMultiplier = this.animationFrame / this.animationTime;
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${1.2 - animationMultiplier}`;
        ctx.fillRect(pos.x * squareSize - ((squareSize / 4) * (1 - fallDownMultiplier)), pos.y * squareSize - ((squareSize / 4) * (1 - fallDownMultiplier)), squareSize, squareSize);
    }
}
//# sourceMappingURL=pathFinder.js.map