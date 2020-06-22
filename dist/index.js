import Controller from "./controller";
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
if (ctx != null) {
    ctx.imageSmoothingEnabled = false;
    const controller = new Controller(ctx);
    const update = (time) => {
        controller.draw(time);
        window.requestAnimationFrame(update);
    };
    update(0);
}
//# sourceMappingURL=index.js.map