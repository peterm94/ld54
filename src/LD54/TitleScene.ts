import {AnimatedSprite, Component, Entity, FrameTriggerSystem, Scene, Sprite, System, TextDisp} from "lagom-engine";
import {LD54} from "./LD54.ts";
import {MainScene} from "./MainScene.ts";
import {ActionOnPress} from "./ActionOnPress.ts";

export class TitleScene extends Scene {
    onAdded() {
        super.onAdded();

        this.addSystem(new MoveLeft());
        this.addGlobalSystem(new FrameTriggerSystem());

        const disp = this.addGUIEntity(new Entity("titlesc", 0, 0, 0));
        disp.addComponent(new Sprite(this.game.getResource("title").textureFromIndex(0)));

        this.addSystem(new ActionOnPress(() => {
            this.game.setScene(new MainScene(this.game))
        }));



        const atlas = this.game.getResource("atlas");

        const rocket = this.addGUIEntity(new Entity("rocketdisp", 128, 128, 10))
        rocket.addComponent(new AnimatedSprite(atlas.textureSliceFromRow(0, 1, 4), {
            xAnchor: 0.5,
            yAnchor: 0.5,
            xScale: 2,
            yScale:2,
            xOffset: -2,
            animationSpeed: 100
        }))

        const stars = this.addGUIEntity(new Entity("stars", 0, 70, 7));
        stars.addComponent(new Sprite(this.game.getResource("stars").textureFromIndex(0)));
        stars.addComponent(new MoveMe());

        const stars2 = this.addGUIEntity(new Entity("stars", 256, 70, 7));
        stars2.addComponent(new Sprite(this.game.getResource("stars").textureFromIndex(0)));
        stars2.addComponent(new MoveMe());
    }
}

class MoveMe extends Component {
}

class MoveLeft extends System<[MoveMe]> {
    types = () => [MoveMe];

    update(delta: number): void {

        this.runOnEntities((entity, component) => {
            entity.transform.x -= delta * 0.2;

            if (entity.transform.x < -256) {
                entity.transform.x += 512;
            }
        });
    }

}

export class LastScene extends Scene {

    onAdded() {
        super.onAdded();

        const token = this.game.getResource("atlas").texture(2, 2);
        const entity = this.addGUIEntity(new Entity("levelstuff"))
        entity.addComponent(new TextDisp(80, 10, "GAME COMPLETE", {
            fontFamily: "myPixelFont",
            fill: 0xfbf5ef,
            fontSize: 12
        }))

        LD54.levelStats.forEach((value, i) => {
            const x = i < 10 ? 20 : 145
            const y = 35 + (i % 10) * 20;
            entity.addComponent(new TextDisp(x, y, `L${value.id.toString().padStart(2, '0')}: ${value.time.toString().padStart(3, '0')}s`, {
                fontFamily: "myPixelFont",
                fill: 0xfbf5ef,
                fontSize: 12
            }))
            if (value.bonus) {
                entity.addComponent(new Sprite(token, {xOffset: x + 80, yOffset: y - 2}));
            }
        })
        entity.addComponent(new TextDisp(51, 240, "THANKS FOR PLAYING!", {
            fontFamily: "myPixelFont",
            fill: 0xfbf5ef,
            fontSize: 12
        }))
    }
}