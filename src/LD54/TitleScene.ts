import {Entity, Key, Scene, Sprite, System, TextDisp} from "lagom-engine";
import {LD54} from "./LD54.ts";
import {MainScene} from "./MainScene.ts";

export class TitleScene extends Scene {
    onAdded() {
        super.onAdded();

        const disp = this.addGUIEntity(new Entity("leveldisp", 0, 0, 0));
        disp.addComponent(new Sprite(this.game.getResource("title").textureFromIndex(0)));
    }
    update(delta: number) {
        super.update(delta);

        if (this.game.keyboard.isKeyPressed(Key.Space, Key.KeyA, Key.KeyD, Key.KeyW, Key.KeyS, Key.KeyZ, Key.KeyX)) {
            this.game.setScene(new MainScene(this.game));
        }
    }
}