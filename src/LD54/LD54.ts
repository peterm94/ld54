import {AudioAtlas, Game, Log, LogLevel, Scene, SpriteSheet} from "lagom-engine";
import atlasSpr from "../art/atlas.png";
import titleSpr from "../art/title.png";
import completeSpr from "../art/complete.png";
import WebFont from "webfontloader";
import {TitleScene} from "./TitleScene.ts";
import rocketSfx from "../sfx/rocket.wav";
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

export const bonusTimes = new Map([[1, 10], [2, 10],
    [3, 10], [4, 10], [5, 12], [6, 7], [7, 25], [8, 5], [9, 6], [10, 10], [11, 10],
    [12, 6],[13, 9],[14, 19],[15, 10],[16, 7],[17, 11],[18, 10],[19, 11],[20, 20]]);

export class LD54 extends Game {

    static currentLevel = 1;
    static currentLevelTime = 0;
    static currentLevelBonus = false;

    static levelStats: LevelStats[] = []
    static TOTAL_LEVELS = 20;

    static muted = false;
    static musicPlaying = false;
    static audioAtlas: AudioAtlas = new AudioAtlas();


    constructor() {
        super({
            width: 256,
            height: 256,
            resolution: 3,
            backgroundColor: 0x272744
        });

        Log.logLevel = LogLevel.NONE;
        this.addResource("atlas", new SpriteSheet(atlasSpr, 16, 16));
        this.addResource("title", new SpriteSheet(titleSpr, 256, 256));
        this.addResource("complete", new SpriteSheet(completeSpr, 128, 96));

        this.setScene(new DummyScene(this));

        // const music = LD54.audioAtlas.load("music", grooveMusic);
        // music.loop(true);
        // music.volume(0.7);

        LD54.audioAtlas.load("rocket", rocketSfx).volume(0.3);
        // LD50.audioAtlas.load("smallExplosion", smallExplosionSound).volume(0.5);
        // LD50.audioAtlas.load("peopleEscape", peopleEscapeSound).volume(0.3);
        // LD50.audioAtlas.load("rocketBuilt", rocketBuiltSound).volume(0.4);
        // LD50.audioAtlas.load("rocketLaunch", rocketLaunchSound).volume(0.4);
        // LD50.audioAtlas.load("bigRocketLaunch", bigRocketLaunchSound).volume(0.5);
        // LD50.audioAtlas.load("rocketAvailable", rocketAvailable).volume(0);

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