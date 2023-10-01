import {Entity, TextDisp, Timer} from "lagom-engine";
import {LD54} from "./LD54.ts";

export class Tracker extends Entity {
    constructor() {
        super("tracker");
    }

    onAdded() {
        super.onAdded();
        this.addComponent(new TextDisp(10, 225, LD54.currentLevel.toString(), {fontFamily: "myPixelFont", fill: 0xfbf5ef, fontSize: 24}));
        let timedisp = this.addComponent(new TextDisp(40, 235, "000", {fontFamily: "myPixelFont", fill: 0xfbf5ef, fontSize: 12}))

        this.addComponent(new Timer(1000, timedisp, true)).onTrigger.register((caller, data) => {
            LD54.currentLevelTime++;
            data.pixiObj.text = LD54.currentLevelTime.toString().padStart(3, '0');
        })
    }

}