import * as PIXI from "pixi.js";
import {PIXIGraphicsComponent} from "lagom-engine";

export class RenderPie extends PIXIGraphicsComponent
{
    /**
     * Create a new circle.
     *
     * @param xOff Positional X offset.
     * @param yOff Positional Y offset.
     * @param radius Radius of the circle.
     * @param fillColour The inner fill colour. Null for transparent.
     * @param lineColour The colour of the line.
     */
    constructor(xOff: number,
                yOff: number,
                radius: number,
                percentage: number,
                fillColour: number,
                lineColour: number = PIXIGraphicsComponent.defaultLine)
    {
        super(fillColour, lineColour);

        this.pixiObj.beginFill(fillColour);
        this.pixiObj.lineStyle(1, lineColour);
        this.pixiObj.moveTo(xOff, yOff);
        this.pixiObj.arc(xOff, yOff, radius, 0,  percentage * Math.PI, false);
        this.pixiObj.lineTo(xOff, yOff);
        this.pixiObj.endFill();
    }
}
