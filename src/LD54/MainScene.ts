import {
    CollisionMatrix,
    Component, DebugCollisionSystem,
    Entity,
    FrameTriggerSystem,
    GlobalSystem,
    Key,
    LagomType,
    MathUtil,
    Scene,
    SimplePhysics,
    TextDisp, TimerSystem
} from "lagom-engine";
import {DiscreteRbodyCollisionSystem} from "./Physics.ts";
import {TiledMap, TiledMapLoader} from "./TiledMapLoader.ts";
import levels from "../levels/level1.json";
import {Player, PlayerMover, Shrinker} from "./Player.ts";
import {BlockMover, MovingWall} from "./MovingWall.ts";
import {Token, TokenExpirer} from "./Token.ts";
import {Layer, LD54} from "./LD54.ts";
import {SlopeWall, Wall} from "./Wall.ts";
import {KeyTile, LockedWall} from "./LockedWall.ts";
import {Exit} from "./Exit.ts";

export class MainScene extends Scene {

    onAdded() {
        super.onAdded();


        const collisionMatrix = new CollisionMatrix();
        collisionMatrix.addCollision(Layer.PLAYER, Layer.WALL);
        collisionMatrix.addCollision(Layer.WALL, Layer.WALL);
        collisionMatrix.addCollision(Layer.PLAYER, Layer.EXIT);
        collisionMatrix.addCollision(Layer.PLAYER, Layer.KEY);
        collisionMatrix.addCollision(Layer.PLAYER, Layer.TOKEN);
        collisionMatrix.addCollision(Layer.PLAYER_SUCK, Layer.EXIT);

        this.addSystem(new SimplePhysics());
        this.addSystem(new PlayerMover());
        this.addSystem(new Shrinker());
        this.addSystem(new BlockMover());
        this.addSystem(new TokenExpirer());
        this.addGlobalSystem(new TimerSystem());
        const collSystem = this.addGlobalSystem(new DiscreteRbodyCollisionSystem(collisionMatrix));
        // this.addGlobalSystem(new DebugCollisionSystem(collSystem));
        this.addGlobalSystem(new Cheats());
        this.addGlobalSystem(new FrameTriggerSystem());
        const loader = new TiledMapLoader(levels as TiledMap);

        const layerCount = loader.map.layers.length;
        LD54.currentLevel = MathUtil.clamp(LD54.currentLevel, 0, layerCount);

        const disp = this.addGUIEntity(new Entity("leveldisp", 10, 225, 0));
        disp.addComponent(new TextDisp(0, 0, LD54.currentLevel.toString(), {fontFamily: "myPixelFont", fill: 0xfbf5ef, fontSize: 24}));

        console.log(LD54.currentLevel.toString());
        loader.loadFn(LD54.currentLevel.toString(), (tileId, x, y) => {
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

class Cheats extends GlobalSystem {
    types(): LagomType<Component>[] {
        return [];
    }

    update(delta: number): void {
        if (this.getScene().game.keyboard.isKeyPressed(Key.ArrowLeft)) {
            --LD54.currentLevel;
            this.scene.game.setScene(new MainScene(this.scene.game));
        }
        if (this.getScene().game.keyboard.isKeyPressed(Key.ArrowRight)) {
            ++LD54.currentLevel;
            this.scene.game.setScene(new MainScene(this.scene.game));
        }
    }
}