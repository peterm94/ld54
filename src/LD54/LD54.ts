import {Game, Log, LogLevel, Scene, SpriteSheet} from "lagom-engine";
import atlasSpr from "../art/atlas.png";
import titleSpr from "../art/title.png";
import completeSpr from "../art/complete.png";
import WebFont from "webfontloader";
import {LastScene, TitleScene} from "./TitleScene.ts";

export enum Layer {
    TOKEN,
    WALL,
    EXIT,
    KEY,
    PLAYER,
    PLAYER_SUCK,
}

class DummyScene extends Scene {
}

export interface LevelStats {
    id: number,
    time: number,
    bonus: boolean
}

export class LD54 extends Game {

    static currentLevel = 1;
    static currentLevelTime = 0;
    static currentLevelBonus = false;

    static levelStats: LevelStats[] = []
    static TOTAL_LEVELS = 20;

    constructor() {
        super({
            width: 256,
            height: 256,
            resolution: 2,
            backgroundColor: 0x272744
        });

        Log.logLevel = LogLevel.NONE;
        this.addResource("atlas", new SpriteSheet(atlasSpr, 16, 16));
        this.addResource("title", new SpriteSheet(titleSpr, 256, 256));
        this.addResource("complete", new SpriteSheet(completeSpr, 128, 96));

        this.setScene(new DummyScene(this));

        WebFont.load({
            custom: {
                families: ["myPixelFont", "myPixelFont2"]
            }
        });

        this.resourceLoader.loadAll().then(
            () => {
                // this.setScene(new LastScene(this));
                this.setScene(new TitleScene(this));
                // this.setScene(new MainScene(this));
            }
        )
    }
}