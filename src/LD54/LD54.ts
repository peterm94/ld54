import {Game, Log, LogLevel, Scene, SpriteSheet} from "lagom-engine";
import atlasSpr from "../art/atlas.png";
import titleSpr from "../art/title.png";
import completeSpr from "../art/complete.png";
import WebFont from "webfontloader";
import {TitleScene} from "./TitleScene.ts";
import {MainScene} from "./MainScene.ts";

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

export class LD54 extends Game {

    static currentLevel = 1;
    static currentLevelTime = 0;
    static currentLevelBonus = false;

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
                this.setScene(new TitleScene(this));
                // this.setScene(new MainScene(this));
            }
        )
    }
}