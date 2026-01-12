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

  // 画面サイズを取得
  const getScreenSize = () => ({
    width: window.innerWidth,
    height: window.innerHeight
  })

  const screenSize = getScreenSize()

  // PixiJSアプリケーションを作成
  const app = new PIXI.Application()
  await app.init({
    width: screenSize.width,
    height: screenSize.height,
    backgroundColor: 0x87ceeb,
    resizeTo: window, // ウィンドウサイズに自動リサイズ
  })
  container.appendChild(app.canvas)

  // ゲームを開始（動的サイズを渡す）
  const game = new Game(app, Matter, PIXI)

  // リサイズイベントに対応
  window.addEventListener('resize', () => {
    const newSize = getScreenSize()
    app.renderer.resize(newSize.width, newSize.height)
    // 箱の位置を再計算して描画を更新
    game.handleResize()
  })
}

init().catch(console.error)
