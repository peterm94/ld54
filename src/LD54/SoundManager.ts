import {AnimatedSpriteController, Button, Component, Entity, Key, System, Timer} from "lagom-engine";

import {LD54} from "./LD54.ts";

class MuteComp extends Component {
}

const GAME_WIDTH = 256;
const GAME_HEIGHT = 256;

class MuteListener extends System<[AnimatedSpriteController, MuteComp]> {
    types = () => [AnimatedSpriteController, MuteComp];

    update(delta: number): void {
        this.runOnEntities((e: Entity, spr: AnimatedSpriteController) => {
            if (this.scene.game.mouse.isButtonPressed(Button.LEFT)) {
                const pos = e.scene.game.renderer.plugins.interaction.mouse.global;

                if (pos.x >= GAME_WIDTH - 24 && pos.x <= GAME_WIDTH - 8 && pos.y >= GAME_HEIGHT - 24 && pos.y <= GAME_HEIGHT - 8) {
                    (e.scene.getEntityWithName("audio") as SoundManager).toggleMute();
                    spr.setAnimation(Number(LD54.muted));
                }
            } else if (this.scene.game.keyboard.isKeyPressed(Key.KeyM)) {
                (e.scene.getEntityWithName("audio") as SoundManager).toggleMute();
                spr.setAnimation(Number(LD54.muted));
            }
        });
    }
}

export class SoundManager extends Entity {
    constructor() {
        super("audio", GAME_WIDTH - 16 - 8, GAME_HEIGHT - 24, 0);

        this.startMusic();
    }

    onAdded(): void {
        super.onAdded();

        this.addComponent(new MuteComp());
        const spr = this.addComponent(new AnimatedSpriteController(Number(LD54.muted), [
            {
                id: 0,
                textures: [this.scene.game.getResource("atlas").texture(4, 1)]
            }, {
                id: 1,
                textures: [this.scene.game.getResource("atlas").texture(5, 1)]
            }]));

        this.addComponent(new Timer(50, spr, false)).onTrigger.register((caller, data) => {
            data.setAnimation(Number(LD54.muted));
        });

        this.scene.addSystem(new MuteListener());
    }

    toggleMute() {
        LD54.muted = !LD54.muted;

        if (LD54.muted) {
            this.stopAllSounds();
        } else {
            this.startMusic();
        }
    }

    startMusic() {
        if (!LD54.muted && !LD54.musicPlaying) {
            LD54.audioAtlas.play("music");
            LD54.musicPlaying = true;
        }
    }

    stopAllSounds(music = true) {
        if (music) {
            LD54.audioAtlas.sounds.forEach((v: any, k: string) => v.stop());
            LD54.musicPlaying = false;
        } else {
            LD54.audioAtlas.sounds.forEach((v: any, k: string) => {
                if (k !== "music") v.stop();
            });
        }
    }

    onRemoved(): void {
        super.onRemoved();
        this.stopAllSounds(false);
    }

    playSound(name: string, restart = false) {
        if (!LD54.muted) {
            if (LD54.audioAtlas.sounds.get(name).playing() && !restart) return;
            LD54.audioAtlas.play(name);
        }
    }

    stopSound(name: string) {
        LD54.audioAtlas.sounds.forEach((value, key) => {
            if (key === name) {
                value.stop();
            }
        })
    }
}
