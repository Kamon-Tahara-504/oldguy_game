// CDNからPixiJSとMatter.jsをimport
import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@latest/dist/pixi.min.mjs'
import Matter from 'https://cdn.skypack.dev/matter-js'
import { Game } from './game.js'

// ゲームを初期化
async function init() {
  const container = document.getElementById('app')
  if (!container) {
    console.error('Container element not found')
    return
  }

  // PixiJSアプリケーションを作成
  const app = new PIXI.Application()
  await app.init({
    width: 800,
    height: 600,
    backgroundColor: 0x87ceeb,
  })
  container.appendChild(app.canvas)

  // ゲームを開始
  new Game(app, Matter, PIXI)
}

init().catch(console.error)
