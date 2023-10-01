import {AnimatedSprite, CircleCollider, CollisionSystem, Entity} from "lagom-engine";
import {Layer} from "./LD54.ts";

export class Exit extends Entity {

    constructor(x: number, y: number, readonly collSystem: CollisionSystem) {
        super("exit", x, y, Layer.EXIT);
    }

    onAdded() {
        super.onAdded();
        const sprites = this.scene.game.getResource("atlas").textureSliceFromRow(4, 0, 3);
        this.addComponent(new AnimatedSprite(sprites, {animationSpeed: 200}));

        this.addComponent(new CircleCollider(this.collSystem, {radius: 8, xOff: 8, yOff: 8, layer: Layer.EXIT}));
    }
}