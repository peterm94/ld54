import {CircleCollider, CollisionSystem, Entity, Sprite} from "lagom-engine";
import {Layer} from "./LD54.ts";

export class Exit extends Entity {

    constructor(x: number, y: number, readonly collSystem: CollisionSystem) {
        super("exit", x, y, Layer.EXIT);
    }

    onAdded() {
        super.onAdded();
        const sprite = this.scene.game.getResource("atlas").texture(0, 2);

        this.addComponent(new Sprite(sprite));
        this.addComponent(new CircleCollider(this.collSystem, {radius: 8, xOff: 8, yOff: 8, layer: Layer.EXIT}));
    }
}