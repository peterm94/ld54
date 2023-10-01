import {CircleCollider, CollisionSystem, Entity, RectCollider, Sprite} from "lagom-engine";
import {Layer} from "./LD54.ts";

export class LockedWall extends Entity {

    constructor(x: number, y: number, readonly collSystem: CollisionSystem) {
        super("lockedwall", x + 8, y + 8, Layer.WALL);
    }

    onAdded() {
        super.onAdded();
        const sprite = this.scene.game.getResource("atlas").texture(1, 1);

        this.addComponent(new Sprite(sprite, {xAnchor: 0.5, yAnchor: 0.5}));
        this.addComponent(new RectCollider(this.collSystem, {width: 16, height: 16, layer: Layer.WALL, xOff: -8, yOff: -8}));
    }
}


export class KeyTile extends Entity {
    constructor(x: number, y: number, readonly collSystem: CollisionSystem) {
        super("key", x + 8, y + 8, Layer.KEY);
    }

    onAdded() {
        super.onAdded();
        const sprite = this.scene.game.getResource("atlas").texture(2, 1);

        this.addComponent(new Sprite(sprite, {xAnchor: 0.5, yAnchor: 0.5}));
        this.addComponent(new CircleCollider(this.collSystem, {radius: 8, layer: Layer.KEY}));
    }
}
