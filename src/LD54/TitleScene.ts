import {Entity, Key, Scene, Sprite, System, TextDisp} from "lagom-engine";
import {LD54} from "./LD54.ts";
import {MainScene} from "./MainScene.ts";
import {ActionOnPress} from "./ActionOnPress.ts";

export class TitleScene extends Scene {
    onAdded() {
        super.onAdded();

        const disp = this.addGUIEntity(new Entity("leveldisp", 0, 0, 0));
        disp.addComponent(new Sprite(this.game.getResource("title").textureFromIndex(0)));

        this.addSystem(new ActionOnPress(() => {
            this.game.setScene(new MainScene(this.game))
        }));
    }
}