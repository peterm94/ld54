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
    Rigidbody,
    ScreenShake,
    SimplePhysicsBody,
    Sprite,
    System,
    TextDisp,
    Timer
} from "lagom-engine";
import {MainScene} from "./MainScene.ts";
import {Layer, LD54} from "./LD54.ts";
import {ActionOnPress} from "./ActionOnPress.ts";
import {LastScene} from "./TitleScene.ts";
import {RenderPie} from "./RenderPie.ts";

export class Player extends Entity {

    constructor(x: number, y: number, readonly collSystem: CollisionSystem,readonly angle: number) {
        super("player", x + 8, y + 8, Layer.PLAYER);
    }

    onAdded() {
        super.onAdded();

        this.transform.angle = this.angle;
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
                    caller.getEntity().addComponent(new ShrinkMe(() => {
                        const timer = this.scene.addEntity(new Entity("delayed")).addComponent(new Timer(500, null));
                        timer.onTrigger.register(() => {
                            this.scene.addGUIEntity(new EndOfLevel());
                        });
                    }));
                    caller.getEntity().getComponent(PlayerControlled)?.destroy();
                    caller.getEntity().getComponent(Collider)?.destroy();
                    caller.getScene().getEntityWithName("tracker")?.getComponent(Timer)?.destroy();
                    caller.getEntity().addComponent(new ScreenShake(0.5, 1000));
                    break;
                case Layer.WALL:
                    caller.getEntity().addComponent(new ShrinkMe(() => {
                        const timer = this.scene.addEntity(new Entity("delayed")).addComponent(new Timer(500, null));
                        timer.onTrigger.register(() => {
                            this.scene.game.setScene(new MainScene(this.scene.game));
                        });
                    }));
                    caller.getEntity().getComponent(PlayerControlled)?.destroy();
                    caller.getEntity().getComponent(Collider)?.destroy();
                    caller.getScene().getEntityWithName("tracker")?.getComponent(Timer)?.destroy();
                    caller.getEntity().addComponent(new ScreenShake(1, 500));
                    break;
                case Layer.KEY:
                    data.other.getEntity().addComponent(new ShrinkMe(() => {
                    }));
                    this.scene.entities.filter(value => value.name === "lockedwall").forEach(value => value.addComponent(new ShrinkMe(() => {
                    })));
                    break;
                case Layer.TOKEN:
                    data.other.getEntity().addComponent(new ShrinkMe(() => {
                    }));
                    data.other.getEntity().getComponent(RenderPie)?.destroy();
                    LD54.currentLevelBonus = true;
                    break;
                default:
            }
        })

    }
}

export class ShrinkMe extends Component {
    scale = 1;

    constructor(readonly endAction: () => void) {
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

        this.scene.addSystem(new ActionOnPress(() => {
            this.scene.game.setScene(new MainScene(this.scene.game))
        }, [Key.KeyR]));

        if (LD54.currentLevel < LD54.TOTAL_LEVELS) {
            this.addComponent(new Timer(300, null)).onTrigger.register(caller => {
                this.scene.addSystem(new ActionOnPress(() => {
                    LD54.levelStats.push({id: LD54.currentLevel, bonus: LD54.currentLevelBonus, time: LD54.currentLevelTime});
                    LD54.currentLevel++;
                    this.scene.game.setScene(new MainScene(this.scene.game))
                }, [Key.Space]));
            });
        } else {
            this.addComponent(new Timer(300, null)).onTrigger.register(caller => {
                this.scene.addSystem(new ActionOnPress(() => {
                    LD54.levelStats.push({id: LD54.currentLevel, bonus: LD54.currentLevelBonus, time: LD54.currentLevelTime});
                    LD54.currentLevel++;
                    this.scene.game.setScene(new LastScene(this.scene.game))
                }, [Key.Space]));
            });
        }
        this.addComponent(new TextDisp(22, 30, `TIME: ${LD54.currentLevelTime.toString().padStart(3, '0')}`, {fontFamily: "myPixelFont2", fill: 0xfbf5ef, fontSize: 12}));
        if (LD54.currentLevelBonus || true) {
            this.addComponent(new TextDisp(22, 45, "BONUS:", {fontFamily: "myPixelFont2", fill: 0xfbf5ef, fontSize: 12}));
            this.addComponent(new Sprite(token, {xOffset: 80, yOffset: 45}));
        }

        this.addComponent(new TextDisp(14, 68, "<R> Restart", {fontFamily: "myPixelFont2", fill: 0xfbf5ef, fontSize: 8}));
        this.addComponent(new TextDisp(14, 79, "<Space> Continue", {fontFamily: "myPixelFont2", fill: 0xfbf5ef, fontSize: 8}));
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
                shrinkMe.endAction();
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
