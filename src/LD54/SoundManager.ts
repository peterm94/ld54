import {
    AnimatedSpriteController,
    Button,
    Component,
    Entity,
    Key,
    Mouse,
    SpriteSheet,
    System,
    Timer
} from "lagom-engine";

import {Layer, LD54} from "./LD54.ts";

class MuteComp extends Component
{
}
const GAME_WIDTH = 256;

class MuteListener extends System<[AnimatedSpriteController, MuteComp]>
{
    types = () => [AnimatedSpriteController, MuteComp];

    update(delta: number): void
    {
        this.runOnEntities((e: Entity, spr: AnimatedSpriteController) => {
            if (this.scene.game.mouse.isButtonPressed(Button.LEFT))
            {
                const pos = e.scene.game.renderer.plugins.interaction.mouse.global;

                if (pos.x >= GAME_WIDTH - 24 && pos.x <= GAME_WIDTH - 8 && pos.y >= 8 && pos.y <= 24)
                {
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

export class SoundManager extends Entity
{
    constructor()
    {
        super("audio", GAME_WIDTH - 16 - 8, 8, 0);

        this.startMusic();
    }

    onAdded(): void
    {
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

    toggleMute()
    {
        LD54.muted = !LD54.muted;

        if (LD54.muted)
        {
            this.stopAllSounds();
        }
        else
        {
            this.startMusic();
        }
    }

    startMusic()
    {
        if (!LD54.muted && !LD54.musicPlaying)
        {
            LD54.audioAtlas.play("music");
            LD54.musicPlaying = true;
        }
    }

    stopAllSounds(music = true)
    {
        if (music)
        {
            LD54.audioAtlas.sounds.forEach((v: any, k: string) => v.stop());
            LD54.musicPlaying = false;
        }
        else
        {
            LD54.audioAtlas.sounds.forEach((v: any, k: string) => {
                if (k !== "music") v.stop();
            });
        }
    }

    onRemoved(): void
    {
        super.onRemoved();
        this.stopAllSounds(false);
    }

    playSound(name: string)
    {
        if (!LD54.muted)
        {
            LD54.audioAtlas.play(name);
        }
    }
}
