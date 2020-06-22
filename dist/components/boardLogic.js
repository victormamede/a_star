import Board from "./board";
import Wall from "./nodes/wall";
import StartPoint from "./nodes/startpoint";
import EndPoint from "./nodes/endpoint";
import Water from "./nodes/water";
import Mud from "./nodes/mud";
export default class BoardLogic extends Board {
    constructor(_size, _squareSize) {
        super(_size, _squareSize);
        this.currentKey = '';
        this.factories = {
            start: { label: 'Start Point', factory: position => new StartPoint(position) },
            end: { label: 'End Point', factory: position => new EndPoint(position) },
            wall: { label: 'Wall', factory: position => new Wall(position) },
            water: { label: 'Water', factory: position => new Water(position) },
            mud: { label: 'Mud', factory: position => new Mud(position) }
        };
        const toPlace = document.getElementById('toplace-selector');
        if (toPlace != null) {
            for (let key of Object.keys(this.factories)) {
                const newElement = document.createElement('input');
                newElement.type = 'radio';
                newElement.name = 'toplace';
                newElement.id = 'toplace-' + key;
                newElement.className = 'custom-control-input';
                newElement.addEventListener('change', () => {
                    this.currentKey = key;
                });
                const labelElement = document.createElement('label');
                labelElement.className = 'custom-control-label';
                labelElement.htmlFor = 'toplace-' + key;
                labelElement.innerHTML = this.factories[key].label;
                const divElement = document.createElement('div');
                divElement.className = 'custom-control custom-radio';
                divElement.appendChild(newElement);
                divElement.appendChild(labelElement);
                toPlace.appendChild(divElement);
            }
        }
    }
    onClick(e) {
        const position = {
            x: Math.floor(e.offsetX / this.squareSize),
            y: Math.floor(e.offsetY / this.squareSize)
        };
        if (!(this.currentKey in this.factories)) {
            return;
        }
        switch (e.buttons) {
            case 1:
                this.addNode(this.factories[this.currentKey].factory(position));
                this.pathFinder.start();
                break;
            case 2:
                this.removeNode(position);
                this.pathFinder.start();
                break;
        }
    }
    removeNode(pos) {
        const [index] = this.getNode(pos);
        if (index === -1) {
            return;
        }
        this.nodes.splice(index, 1);
    }
}
//# sourceMappingURL=boardLogic.js.map