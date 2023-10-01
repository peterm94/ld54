import {CircleCollider, CollisionSystem, Component, Entity, Sprite, System} from "lagom-engine";
import {RenderPie} from "./RenderPie.ts";
import {Layer} from "./LD54.ts";

export class Token extends Entity {
    constructor(x: number, y: number, readonly collSystem: CollisionSystem, readonly ttl: number) {
        super("token", x + 8, y + 8, Layer.TOKEN);
    }

    onAdded() {
        super.onAdded();
        const sprite = this.scene.game.getResource("atlas").texture(2, 2);

        this.addComponent(new RenderPie(0, 0, 7, 0.20, 0xc69fa5, 0xc69fa5));
        this.addComponent(new Sprite(sprite, {xAnchor: 0.5, yAnchor: 0.5}));
        this.addComponent(new CircleCollider(this.collSystem, {radius: 8, layer: Layer.TOKEN}));
        this.addComponent(new Ttl(this.ttl));

    }
}


class Ttl extends Component {
    start: number;

    constructor(readonly ttl: number) {
        super();
        this.start = ttl;
    }
}

export class TokenExpirer extends System<[Ttl, RenderPie]> {
    types = () => [Ttl, RenderPie];

    update(delta: number): void {
        this.runOnEntities((entity, ttl, pie) => {
            ttl.start -= delta / 1000;
            pie.setPercent(ttl.start * 2 / ttl.ttl);

            if (ttl.start <= 0) {
                entity.destroy();
            }
        })
    }
}
