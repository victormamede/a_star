export abstract class Component {
  public abstract draw(deltaTime: number, ctx: CanvasRenderingContext2D): void;
}