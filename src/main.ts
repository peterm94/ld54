import {LD54} from "./LD54.ts";
import "./main.css";
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="main" style="align-items: center; justify-content: center; height: 100%; display: flex">
  </div>
<!--  <canvas id="detect-render" width="256" height="256""></canvas>-->

`

const main = document.querySelector<HTMLDivElement>('#main')!;

const game = new LD54();

main.appendChild(game.renderer.view);
game.start();