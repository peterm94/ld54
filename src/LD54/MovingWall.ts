import {
    BodyType,
    CollisionSystem,
    Component,
    Entity,
    MathUtil,
    RectCollider,
    Rigidbody,
    Sprite,
    System
} from "lagom-engine";
import {Layer} from "./LD54.ts";

export class MovingWall extends Entity {
    constructor(x: number, y: number, readonly collSystem: CollisionSystem, private direction: number) {
        super("wall", x, y, Layer.WALL);
    }

    onAdded() {
        super.onAdded();
        const sprite = this.scene.game.getResource("atlas").texture(1, 2);

        this.addComponent(new Sprite(sprite));
        const collider = this.addComponent(new RectCollider(this.collSystem, {
            width: 16,
            height: 16,
            layer: Layer.WALL
        }));
        this.addComponent(new BlockMoveMe(this.direction));
        this.addComponent(new Rigidbody(BodyType.Discrete));

        collider.onTriggerEnter.register((caller, data) => {
            if (data.other.layer === Layer.WALL) {
                const body = caller.getEntity().getComponent<Rigidbody>(Rigidbody)!;

                // undo movement
                body.move(-data.result.overlap * data.result.overlap_x, -data.result.overlap * data.result.overlap_y)

                const comp = caller.getEntity().getComponent<BlockMoveMe>(BlockMoveMe)!;

                // left-right
                if (comp.direction % 2 !== 0 && data.result.overlap_y) {
                    comp.direction = (comp?.direction + 2) % 4;
                } else if (comp.direction % 2 === 0 && data.result.overlap_x) {
                    comp.direction = (comp?.direction + 2) % 4;
                }
            }
        })
    }
}


class BlockMoveMe extends Component {
    constructor(public direction: number) {
        super();
    }

}

export class BlockMover extends System<[BlockMoveMe, Rigidbody]> {
    types = () => [BlockMoveMe, Rigidbody]

    speed = 0.01;

    update(delta: number): void {
        this.runOnEntities((entity, moveme, body) => {
            const moveVector = MathUtil.lengthDirXY(delta * this.speed, MathUtil.degToRad(moveme.direction * 90));
            body.move(moveVector.x, moveVector.y);
        });
    }

}