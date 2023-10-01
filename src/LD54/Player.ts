import {
    AnimatedSpriteController,
    BodyType,
    CircleCollider,
    Collider,
    CollisionSystem,
    Component,
    Entity,
    Key,
    MathUtil,
    Rigidbody, ScreenShake,
    SimplePhysicsBody,
    Sprite,
    System,
    TextDisp,
    Timer
} from "lagom-engine";
import {MainScene} from "./MainScene.ts";
import {Layer, LD54} from "./LD54.ts";
import {ActionOnPress} from "./ActionOnPress.ts";

export class Player extends Entity {

    constructor(x: number, y: number, readonly collSystem: CollisionSystem) {
        super("player", x, y, Layer.PLAYER);
    }

    onAdded() {
        super.onAdded();

        const atlas = this.scene.game.getResource("atlas");

        this.addComponent(new Rigidbody(BodyType.Discrete));
        this.addComponent(new AnimatedSpriteController(0, [
            {
                id: 0,
                textures: [atlas.textureFromIndex(0)],
                config: {xAnchor: 0.5, yAnchor: 0.5, xOffset: -2},
            },
            {
                id: 1,
                textures: atlas.textureSliceFromRow(0, 1, 4),
                config: {xAnchor: 0.5, yAnchor: 0.5, xOffset: -2, animationSpeed: 100}
            }
        ]))
        const collider = this.addComponent(new CircleCollider(this.collSystem, {layer: Layer.PLAYER, radius: 4}))
        // this.addComponent(new RenderCircle(0, 0, 4, null, 0xf20f2f));

        this.addComponent(new SimplePhysicsBody({angCap: 0.04, angDrag: 0.005, linCap: 1}));
        this.addComponent(new PlayerControlled());


        collider.onTriggerEnter.register((caller, data) => {

            switch (data.other.layer) {
                case Layer.EXIT:
                    caller.getEntity().addComponent(new ShrinkMe(false));
                    caller.getEntity().getComponent(PlayerControlled)?.destroy();
                    caller.getEntity().getComponent(Collider)?.destroy();
                    caller.getScene().getEntityWithName("tracker")?.getComponent(Timer)?.destroy();
                    caller.getEntity().addComponent(new ScreenShake(0.5, 1000));
                    ++LD54.currentLevel;
                    break;
                case Layer.WALL:
                    caller.getEntity().addComponent(new ShrinkMe(true));
                    caller.getEntity().getComponent(PlayerControlled)?.destroy();
                    caller.getEntity().getComponent(Collider)?.destroy();
                    caller.getScene().getEntityWithName("tracker")?.getComponent(Timer)?.destroy();
                    caller.getEntity().addComponent(new ScreenShake(1, 500));
                    break;
                case Layer.KEY:
                    data.other.getEntity().destroy();
                    this.scene.entities.filter(value => value.name === "lockedwall").forEach(value => value.destroy());
                    break;
                case Layer.TOKEN:
                    data.other.getEntity().destroy();
                    LD54.currentLevelBonus = true;
                    break;
                default:
            }
        })

    }
}

export class ShrinkMe extends Component {
    scale = 1;

    constructor(readonly restart: boolean) {
        super();
    }
}

export class EndOfLevel extends Entity {

    constructor() {
        super("endoflevel", 64, 80, 0);
    }

    onAdded() {
        super.onAdded();
        const complete = this.scene.game.getResource("complete").textureFromIndex(0);
        const token = this.scene.game.getResource("atlas").texture(2, 2);

        this.addComponent(new Sprite(complete));
        this.addComponent(new Timer(300, null)).onTrigger.register(caller => {
            this.scene.addSystem(new ActionOnPress(() => {
                this.scene.game.setScene(new MainScene(this.scene.game))
            }));
        });
        this.addComponent(new TextDisp(22, 40, `TIME: ${LD54.currentLevelTime.toString().padStart(3, '0')}`, {fontFamily: "myPixelFont2", fill: 0xfbf5ef, fontSize: 12}));
        if (LD54.currentLevelBonus) {
            this.addComponent(new TextDisp(22, 60, "BONUS:", {fontFamily: "myPixelFont2", fill: 0xfbf5ef, fontSize: 12}));
            this.addComponent(new Sprite(token, {xOffset: 80, yOffset: 60}));
        }
    }
}

export class Shrinker extends System<[Sprite, ShrinkMe]> {

    speed = 5;
    types = () => [Sprite, ShrinkMe];

    update(delta: number): void {
        this.runOnEntities((entity, sprite, shrinkMe) => {
            shrinkMe.scale -= delta / 1000 * this.speed;
            sprite.applyConfig({yScale: shrinkMe.scale, xScale: shrinkMe.scale});

            if (shrinkMe.scale <= 0) {
                shrinkMe.destroy();
                entity.destroy();
                const timer = this.scene.addEntity(new Entity("delayed")).addComponent(new Timer(500, null));
                if (shrinkMe.restart) {
                    timer.onTrigger.register(() => {
                        this.scene.game.setScene(new MainScene(this.scene.game));
                    });
                } else {
                    timer.onTrigger.register(() => {
                        this.scene.addGUIEntity(new EndOfLevel());
                    });
                }
            }
        })
    }
}

class PlayerControlled extends Component {
}

export class PlayerMover extends System<[SimplePhysicsBody, AnimatedSpriteController, PlayerControlled]> {

    rotateSpeed = 0.15;
    moveSpeed = 0.00005;
    types = () => [SimplePhysicsBody, AnimatedSpriteController, PlayerControlled];

    update(delta: number): void {
        this.runOnEntities((entity, body, sprite) => {
            if (this.getScene().game.keyboard.isKeyDown(Key.KeyA)) {
                body.rotate(MathUtil.degToRad(delta * -this.rotateSpeed));
            }

            if (this.getScene().game.keyboard.isKeyDown(Key.KeyD)) {
                body.rotate(MathUtil.degToRad(delta * this.rotateSpeed));
            }
            if (this.getScene().game.keyboard.isKeyDown(Key.KeyW)) {
                const moveVector = MathUtil.lengthDirXY(delta * this.moveSpeed, entity.transform.rotation);
                body.move(moveVector.x, moveVector.y);
                sprite.setAnimation(1, false);
            } else {
                sprite.setAnimation(0, false);

            }
        })
    }
}
