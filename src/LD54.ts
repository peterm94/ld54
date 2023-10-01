import {
    BodyType,
    CircleCollider,
    CollisionMatrix,
    CollisionSystem,
    Component,
    DebugCollisionSystem,
    Entity,
    Game,
    GlobalSystem,
    Key,
    LagomType,
    Log,
    LogLevel,
    MathUtil,
    PolyCollider,
    RectCollider, RenderPoly,
    Rigidbody,
    Scene,
    SimplePhysics,
    SimplePhysicsBody,
    Sprite,
    SpriteSheet,
    System
} from "lagom-engine";

import {TiledMap, TiledMapLoader} from "./TiledMapLoader.ts";
import {DiscreteRbodyCollisionSystem} from "./Physics.ts";
import atlasSpr from "./art/atlas.png";
import levels from "./levels/level1.json";
import {RenderPie} from "./RenderPie.ts";

enum Layer
{
    WALL,
    PLAYER,
    EXIT,
    KEY,
    TOKEN,
}

let currentLevel = 1;

const collisionMatrix = new CollisionMatrix();
collisionMatrix.addCollision(Layer.PLAYER, Layer.WALL);
collisionMatrix.addCollision(Layer.WALL, Layer.WALL);
collisionMatrix.addCollision(Layer.PLAYER, Layer.EXIT);
collisionMatrix.addCollision(Layer.PLAYER, Layer.KEY);

class MainScene extends Scene
{

    onAdded()
    {
        super.onAdded();

        this.addSystem(new SimplePhysics());
        this.addSystem(new PlayerMover());
        this.addSystem(new BlockMover());
        const collSystem = this.addGlobalSystem(new DiscreteRbodyCollisionSystem(collisionMatrix));
        // this.addGlobalSystem(new DebugCollisionSystem(collSystem));
        this.addGlobalSystem(new Cheats());
        const loader = new TiledMapLoader(levels as TiledMap);

        const layerCount = loader.map.layers.length;
        currentLevel = MathUtil.clamp(currentLevel, 0, layerCount);

        console.log(currentLevel.toString());
        loader.loadFn(currentLevel.toString(), (tileId, x, y) => {
            switch (tileId)
            {
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
                    this.addEntity(new LockedWall(x, y, collSystem));
                    break;
                case 7:
                    // key
                    this.addEntity(new KeyTile(x, y, collSystem));
                    break;
                case 9:
                    // UL
                    this.addEntity(new SlopeWall(x, y, collSystem, 1));
                    break;
                case 10:
                    // BL
                    this.addEntity(new SlopeWall(x, y, collSystem, 0));
                    break;
                case 11:
                    // BR
                    this.addEntity(new SlopeWall(x, y, collSystem, 3));
                    break;
                case 12:
                    // UR
                    this.addEntity(new SlopeWall(x, y, collSystem, 2));
                    break;
                case 13:
                    // right mover
                    this.addEntity(new MovingWall(x, y, collSystem, 0));
                    break;
                case 14:
                    // down mover
                    this.addEntity(new MovingWall(x, y, collSystem, 1));
                    break;
                case 15:
                    // left mover
                    this.addEntity(new MovingWall(x, y, collSystem, 2));
                    break;
                case 16:
                    // up mover
                    this.addEntity(new MovingWall(x, y, collSystem, 3));
                    break;
            }
        },
            (x, y, ttl) => {
            this.addEntity(new Token(x, y, collSystem, ttl));
            })
    }
}

class DummyScene extends Scene
{
}

export class LD54 extends Game
{
    constructor()
    {
        super({
            width: 256,
            height: 256,
            resolution: 2,
            backgroundColor: 0x272744
        });

        Log.logLevel = LogLevel.NONE;
        this.addResource("atlas", new SpriteSheet(atlasSpr, 16, 16));

        this.setScene(new DummyScene(this));

        this.resourceLoader.loadAll().then(
            () => {
                this.setScene(new MainScene(this));
            }
        )
    }
}

class Token extends Entity {
    constructor(x: number, y: number, readonly collSystem: CollisionSystem, readonly ttl: number)
    {
        super("token", x, y, Layer.TOKEN);
    }

    onAdded()
    {
        super.onAdded();
        const sprite = this.scene.game.getResource("atlas").texture(2, 2);

        this.addComponent(new RenderPie(8, 8, 8, 0.20, 0xfbf5ef, 0xfbf5ef));
        this.addComponent(new Sprite(sprite));
        this.addComponent(new CircleCollider(this.collSystem, {radius: 8, yOff: 8, xOff: 8, layer: Layer.TOKEN}));
        // this.addComponent(new Ttl(this.ttl));

    }
}
class MovingWall extends Entity
{
    constructor(x: number, y: number, readonly collSystem: CollisionSystem, private direction: number)
    {
        super("wall", x, y, Layer.WALL);
    }

    onAdded()
    {
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
                body.move(-data.result.overlap * data.result.overlap_x,-data.result.overlap * data.result.overlap_y)

                const comp = caller.getEntity().getComponent<BlockMoveMe>(BlockMoveMe)!;

                // left-right
                if (comp.direction % 2 !== 0 && data.result.overlap_y) {
                    comp.direction = (comp?.direction + 2) % 4;
                } else if (comp.direction % 2 === 0 && data.result.overlap_x){
                    comp.direction = (comp?.direction + 2) % 4;
                }
            }
        })
    }
}

class BlockMoveMe extends Component
{
    constructor(public direction: number)
    {
        super();
    }

}

class BlockMover extends System<[BlockMoveMe, Rigidbody]> {
    types = () => [BlockMoveMe, Rigidbody]

    speed = 0.01;

    update(delta: number): void
    {
        this.runOnEntities((entity, moveme, body) => {
            const moveVector = MathUtil.lengthDirXY(delta * this.speed, MathUtil.degToRad(moveme.direction * 90));
            body.move(moveVector.x, moveVector.y);
        });
    }

}

class Wall extends Entity
{

    constructor(x: number, y: number, readonly collSystem: CollisionSystem)
    {
        super("wall", x, y, Layer.WALL);
    }

    onAdded()
    {
        super.onAdded();
        const sprite = this.scene.game.getResource("atlas").texture(0, 1);

        this.addComponent(new Sprite(sprite));
        this.addComponent(new RectCollider(this.collSystem, {width: 16, height: 16, layer: Layer.WALL}));
    }
}

class SlopeWall extends Entity
{

    colliders = [
        [[0, 0], [0, 16], [16, 16]], // BL
        [[0, 16], [0, 0], [16, 0]], // UL
        [[0, 0], [16, 0], [16, 16]], // UR
        [[0, 16], [16, 16], [16, 0]], // BR
    ]

    constructor(x: number, y: number, readonly collSystem: CollisionSystem, readonly rotation: number)
    {
        super("wall", x, y, Layer.WALL);
    }

    onAdded()
    {
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

class KeyTile extends Entity
{
    constructor(x: number, y: number, readonly collSystem: CollisionSystem)
    {
        super("key", x, y, Layer.KEY);
    }

    onAdded()
    {
        super.onAdded();
        const sprite = this.scene.game.getResource("atlas").texture(2, 1);

        this.addComponent(new Sprite(sprite));
        this.addComponent(new CircleCollider(this.collSystem, {radius: 8, yOff: 8, xOff: 8, layer: Layer.KEY}));
    }
}

class LockedWall extends Entity
{

    constructor(x: number, y: number, readonly collSystem: CollisionSystem)
    {
        super("lockedwall", x, y, Layer.WALL);
    }

    onAdded()
    {
        super.onAdded();
        const sprite = this.scene.game.getResource("atlas").texture(1, 1);

        this.addComponent(new Sprite(sprite));
        this.addComponent(new RectCollider(this.collSystem, {width: 16, height: 16, layer: Layer.WALL}));
    }
}


class Exit extends Entity
{

    constructor(x: number, y: number, readonly collSystem: CollisionSystem)
    {
        super("exit", x, y, Layer.EXIT);
    }

    onAdded()
    {
        super.onAdded();
        const sprite = this.scene.game.getResource("atlas").texture(0, 2);

        this.addComponent(new Sprite(sprite));
        this.addComponent(new CircleCollider(this.collSystem, {radius: 8, xOff: 8, yOff: 8, layer: Layer.EXIT}));
    }
}

class Player extends Entity
{

    constructor(x: number, y: number, readonly collSystem: CollisionSystem)
    {
        super("player", x, y, Layer.PLAYER);
    }

    onAdded()
    {
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

            switch (data.other.layer)
            {
                case Layer.EXIT:
                    ++currentLevel;
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

class PlayerControlled extends Component
{
}

class PlayerMover extends System<[SimplePhysicsBody, PlayerControlled]>
{

    rotateSpeed = 0.15;
    moveSpeed = 0.00005;
    types = () => [SimplePhysicsBody, PlayerControlled];

    update(delta: number): void
    {
        this.runOnEntities((entity, body) => {
            if (this.getScene().game.keyboard.isKeyDown(Key.KeyA))
            {
                body.rotate(MathUtil.degToRad(delta * -this.rotateSpeed));
            }

            if (this.getScene().game.keyboard.isKeyDown(Key.KeyD))
            {
                body.rotate(MathUtil.degToRad(delta * this.rotateSpeed));
            }
            if (this.getScene().game.keyboard.isKeyDown(Key.KeyW))
            {
                const moveVector = MathUtil.lengthDirXY(delta * this.moveSpeed, entity.transform.rotation);
                body.move(moveVector.x, moveVector.y);
            }
        })
    }
}

class Cheats extends GlobalSystem
{
    types(): LagomType<Component>[]
    {
        return [];
    }

    update(delta: number): void
    {
        if (this.getScene().game.keyboard.isKeyPressed(Key.ArrowLeft))
        {
            --currentLevel;
            this.scene.game.setScene(new MainScene(this.scene.game));
        }
        if (this.getScene().game.keyboard.isKeyPressed(Key.ArrowRight))
        {
            ++currentLevel;
            this.scene.game.setScene(new MainScene(this.scene.game));
        }
    }
}