import {MathUtil, PIXIGraphicsComponent} from "lagom-engine";

export class RenderPie extends PIXIGraphicsComponent {
    constructor(readonly xOff: number,
                readonly yOff: number,
                readonly radius: number,
                percentage: number,
                readonly fillColour: number,
                readonly lineColour: number = PIXIGraphicsComponent.defaultLine) {
        super(fillColour, lineColour);

        this.setPercent(percentage);
    }

    setPercent(percentage: number) {
        this.pixiObj.clear();
        this.pixiObj.beginFill(this.fillColour);
        this.pixiObj.lineStyle(1, this.lineColour);
        this.pixiObj.moveTo(this.xOff, this.yOff);
        this.pixiObj.arc(this.xOff, this.yOff, this.radius, MathUtil.degToRad(270), MathUtil.degToRad(270) - percentage * Math.PI, true);
        this.pixiObj.lineTo(this.xOff, this.yOff);
        this.pixiObj.endFill();
    }
}
