import {CollisionSystem, Entity, MathUtil, PolyCollider, RectCollider, Sprite} from "lagom-engine";
import {Layer} from "./LD54.ts";

export class Wall extends Entity {

    constructor(x: number, y: number, readonly collSystem: CollisionSystem) {
        super("wall", x, y, Layer.WALL);
    }

    onAdded() {
        super.onAdded();
        const sprite = this.scene.game.getResource("atlas").texture(0, 1);

        this.addComponent(new Sprite(sprite));
        this.addComponent(new RectCollider(this.collSystem, {width: 16, height: 16, layer: Layer.WALL}));
    }
}


export class SlopeWall extends Entity {

    colliders = [
        [[0, 0], [0, 16], [16, 16]], // BL
        [[0, 16], [0, 0], [16, 0]], // UL
        [[0, 0], [16, 0], [16, 16]], // UR
        [[0, 16], [16, 16], [16, 0]], // BR
    ]

    constructor(x: number, y: number, readonly collSystem: CollisionSystem, readonly rotation: number) {
        super("wall", x, y, Layer.WALL);
    }

    onAdded() {
        super.onAdded();
        const sprite = this.scene.game.getResource("atlas").texture(0, 3);

        this.addComponent(new Sprite(sprite, {
            xAnchor: 0.5,
            yAnchor: 0.5,
            xOffset: 8,
            yOffset: 8,
            rotation: MathUtil.degToRad(this.rotation * 90)
        }));
        this.addComponent(new PolyCollider(this.collSystem, {
            layer: Layer.WALL,
            points: this.colliders[this.rotation]
        }));
    }
}