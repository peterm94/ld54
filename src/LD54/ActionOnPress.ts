import {Component, Key, LagomType, System} from "lagom-engine";

export class ActionOnPress extends System<[]> {

    constructor(readonly action: () => void) {
        super();
    }

    types(): LagomType<Component>[] {
        return [];
    }

    update(delta: number): void {

        if (this.scene.game.keyboard.isKeyPressed(Key.Space, Key.KeyA, Key.KeyD, Key.KeyW, Key.KeyS, Key.KeyZ, Key.KeyX)) {
            this.action();
        }
    }

}