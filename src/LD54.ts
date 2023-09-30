import {
    BodyType,
    CircleCollider,
    CollisionMatrix,
    CollisionSystem,
    Component,
    Entity,
    Game,
    GlobalSystem,
    Key,
    LagomType,
    Log,
    LogLevel,
    MathUtil,
    RectCollider,
    Rigidbody,
    Scene,
    SimplePhysics,
    SimplePhysicsBody,
    Sprite,
    SpriteSheet,
    System
} from "lagom-engine";

import {TiledMapLoader} from "./TiledMapLoader.ts";
import {DiscreteRbodyCollisionSystem} from "./Physics.ts";
import atlasSpr from "./art/atlas.png";
import levels from "./levels/level1.json";

enum Layer {
    WALL,
    PLAYER,
    EXIT,
}

let currentLevel = 1;

const collisionMatrix = new CollisionMatrix();
collisionMatrix.addCollision(Layer.PLAYER, Layer.WALL);
collisionMatrix.addCollision(Layer.PLAYER, Layer.EXIT);

class MainScene extends Scene {

    onAdded() {
        super.onAdded();

        this.addSystem(new SimplePhysics());
        this.addSystem(new PlayerMover());
        const collSystem = this.addGlobalSystem(new DiscreteRbodyCollisionSystem(collisionMatrix));
        // this.addGlobalSystem(new DebugCollisionSystem(collSystem));
        this.addGlobalSystem(new Cheats());
        const loader = new TiledMapLoader(levels);

        const layerCount = loader.map.layers.length;
        currentLevel = MathUtil.clamp(currentLevel, 0, layerCount);

        console.log(currentLevel.toString());
        loader.loadFn(currentLevel.toString(), (tileId, x, y) => {
            switch (tileId) {
                case 0:
                    break;
                case 1:
                    // wall
                    this.addEntity(new Wall(x, y, collSystem));
                    break;
                case 2:
                    // exit
                    this.addEntity(new Exit(x, y, collSystem));
                    break;
                case 3:
                    // player
                    this.addEntity(new Player(x, y, collSystem));
                    break;
                case 4:
                    // tnt
                    break;
                case 5:
                    // breakable wall
                    break;
                case 6:
                    // locked wall
                    break;
                case 7:
                    // key
                    break;
            }
        })
    }
}

class DummyScene extends Scene {
}

export class LD54 extends Game {
    constructor() {
        super({
            width: 256,
            height: 256,
            resolution: 2,
            backgroundColor: 0x272744
        });

        Log.logLevel = LogLevel.DEBUG;
        this.addResource("atlas", new SpriteSheet(atlasSpr, 16, 16));

        this.setScene(new DummyScene(this));

        this.resourceLoader.loadAll().then(
            () => {
                this.setScene(new MainScene(this));
            }
        )
    }
}


class Wall extends Entity {

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

class Exit extends Entity {

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

class Player extends Entity {

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
            if (data.other.layer == Layer.EXIT) {
                ++currentLevel;
            }
            this.scene.game.setScene(new MainScene(this.scene.game));
        })

    }
}

class PlayerControlled extends Component {
}

class PlayerMover extends System<[SimplePhysicsBody, PlayerControlled]> {

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

class Cheats extends GlobalSystem {
    types(): LagomType<Component>[] {
        return [];
    }

    update(delta: number): void {
        if (this.getScene().game.keyboard.isKeyPressed(Key.ArrowLeft)) {
            --currentLevel;
            this.scene.game.setScene(new MainScene(this.scene.game));
        }
        if (this.getScene().game.keyboard.isKeyPressed(Key.ArrowRight)) {
            ++currentLevel;
            this.scene.game.setScene(new MainScene(this.scene.game));
        }
    }
}