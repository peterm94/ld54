import {
    BodyType,
    CircleCollider,
    CollisionSystem,
    Component,
    Entity, Key, MathUtil,
    Rigidbody,
    SimplePhysicsBody,
    Sprite, System
} from "lagom-engine";
import {MainScene} from "./MainScene.ts";
import {Layer, LD54} from "./LD54.ts";

export class Player extends Entity {

    constructor(x: number, y: number, readonly collSystem: CollisionSystem) {
        super("player", x, y, Layer.PLAYER);
    }

    onAdded() {
        super.onAdded();

        const sprite = this.scene.game.getResource("atlas").textureFromIndex(0);

        this.addComponent(new Sprite(sprite, {xAnchor: 0.5, yAnchor: 0.5}));
        // this.addComponent(new RenderCircle(0, 0, 4, 0xa2a832));
        // this.addComponent(new RenderRect(0, 0, 4, 10, 0xa2a832));
        this.addComponent(new Rigidbody(BodyType.Discrete));
        const collider = this.addComponent(new CircleCollider(this.collSystem, {layer: Layer.PLAYER, radius: 4}))
        this.addComponent(new SimplePhysicsBody({angCap: 0.04, angDrag: 0.005, linCap: 1}));
        this.addComponent(new PlayerControlled());


        collider.onTriggerEnter.register((caller, data) => {

            switch (data.other.layer) {
                case Layer.EXIT:
                    ++LD54.currentLevel;
                case Layer.WALL:
                    // this.scene.entities.filter(value => value.name === "wall").forEach(value => {
                    //     value.getComponent<Sprite>(Sprite)?.destroy();
                    //     value.addComponent(new Sprite(this.scene.game.getResource("atlas").texture(3, 1)));
                    // });
                    this.scene.game.setScene(new MainScene(this.scene.game));
                    break;
                case Layer.KEY:
                    data.other.getEntity().destroy();
                    this.scene.entities.filter(value => value.name === "lockedwall").forEach(value => value.destroy());
                    break;
                default:
            }
        })

    }
}


class PlayerControlled extends Component {
}

export class PlayerMover extends System<[SimplePhysicsBody, PlayerControlled]> {

    rotateSpeed = 0.15;
    moveSpeed = 0.00005;
    types = () => [SimplePhysicsBody, PlayerControlled];

    update(delta: number): void {
        this.runOnEntities((entity, body) => {
            if (this.getScene().game.keyboard.isKeyDown(Key.KeyA)) {
                body.rotate(MathUtil.degToRad(delta * -this.rotateSpeed));
            }

            if (this.getScene().game.keyboard.isKeyDown(Key.KeyD)) {
                body.rotate(MathUtil.degToRad(delta * this.rotateSpeed));
            }
            if (this.getScene().game.keyboard.isKeyDown(Key.KeyW)) {
                const moveVector = MathUtil.lengthDirXY(delta * this.moveSpeed, entity.transform.rotation);
                body.move(moveVector.x, moveVector.y);
            }
        })
    }
}
