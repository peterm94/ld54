import {Entity, Key, Scene, Sprite, System, TextDisp} from "lagom-engine";
import {LD54} from "./LD54.ts";
import {MainScene} from "./MainScene.ts";
import {ActionOnPress} from "./ActionOnPress.ts";

export class TitleScene extends Scene {
    onAdded() {
        super.onAdded();

        const disp = this.addGUIEntity(new Entity("titlesc"));
        disp.addComponent(new Sprite(this.game.getResource("title").textureFromIndex(0)));

        this.addSystem(new ActionOnPress(() => {
            this.game.setScene(new MainScene(this.game))
        }));
    }
}

export class LastScene extends Scene {

    onAdded() {
        super.onAdded();

        const token = this.game.getResource("atlas").texture(2, 2);
        const entity = this.addGUIEntity(new Entity("levelstuff"))
        entity.addComponent(new TextDisp(80, 10, "GAME COMPLETE", {fontFamily: "myPixelFont", fill: 0xfbf5ef, fontSize: 12}))

        LD54.levelStats.forEach((value, i) => {
            const x = i < 10 ? 20: 145
            const y = 35 + (i % 10) * 20;
            entity.addComponent(new TextDisp(x, y, `L${value.id.toString().padStart(2, '0')}: ${value.time.toString().padStart(3, '0')}s`, {fontFamily: "myPixelFont", fill: 0xfbf5ef, fontSize: 12}))
            if (value.bonus) {
                entity.addComponent(new Sprite(token, {xOffset: x + 80, yOffset:y - 2}));
            }
        })
        entity.addComponent(new TextDisp(51, 240, "THANKS FOR PLAYING!", {fontFamily: "myPixelFont", fill: 0xfbf5ef, fontSize: 12}))
    }
}