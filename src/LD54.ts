import {
    BodyType,
    CircleCollider,
    CollisionMatrix,
    CollisionSystem,
    Component, DebugCollisionSystem,
    Entity,
    Game,
    Key,
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
import level1 from "./levels/level1.json";
import {TiledMapLoader} from "./TiledMapLoader.ts";
import {DiscreteRbodyCollisionSystem} from "./Physics.ts";
import atlasSpr from "./art/atlas.png";

enum Layer {
    WALL,
    PLAYER,
}

const collisionMatrix = new CollisionMatrix();
collisionMatrix.addCollision(Layer.PLAYER, Layer.WALL);

class MainScene extends Scene {
    onAdded() {
        super.onAdded();

        this.addSystem(new SimplePhysics());
        this.addSystem(new PlayerMover());
        const collSystem = this.addGlobalSystem(new DiscreteRbodyCollisionSystem(collisionMatrix));
        // this.addGlobalSystem(new DebugCollisionSystem(collSystem));
        const loader = new TiledMapLoader(level1);

        loader.loadFn(0, (tileId, x, y) => {
            switch (tileId) {
                case 0:
                    break;
                case 1:
                    // wall
                    this.addEntity(new Wall(x, y, collSystem));
                    break;
                case 2:
                    // exit
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
        const collider = this.addComponent(new CircleCollider(this.collSystem, {layer:Layer.PLAYER, radius: 4}))
        this.addComponent(new SimplePhysicsBody({angCap: 0.04, angDrag: 0.005, linCap: 1}));
        this.addComponent(new PlayerControlled());


        collider.onTriggerEnter.register((caller, data) => {
            this.destroy();
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