import {Pong} from "./Pong.ts";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="main" style="align-items: center; justify-content: center; height: 100%; display: flex">
  </div>
`

const main = document.querySelector<HTMLDivElement>('#main')!;

const game = new Pong();

main.appendChild(game.renderer.view);
game.start();