// リスタート機能の実装

import { createGround, createWalls } from '../physics.js'

export class GameRestart {
  constructor(game) {
    this.game = game
  }

  // ゲームをリスタート
  restart() {
    // 既存のボールをすべて削除
    this.game.state.balls.forEach(ball => {
      ball.destroy()
    })
    this.game.state.balls = []
    
    // 現在のボールを削除
    if (this.game.state.currentBall) {
      this.game.state.currentBall.destroy()
      this.game.state.currentBall = null
    }
    
    // ゲーム状態をリセット
    this.game.state.reset()
    
    // Matter.jsエンジンの世界をクリア
    this.game.Matter.World.clear(this.game.engine.world, false)
    
    // 地面と壁を再作成
    this.game.ground = createGround(this.game.engine, this.game.gameConfig, this.game.Matter)
    this.game.walls = createWalls(this.game.engine, this.game.gameConfig, this.game.Matter)
    
    // ゲームオーバー画面を非表示
    this.game.renderer.gameOverRenderer.hide()
    
    // 地面と壁の描画を再初期化
    this.game.renderer.initGroundAndWalls(this.game.walls)
    
    // スコア表示を更新
    this.game.renderer.updateScore()
    
    // プレビューを更新
    this.game.renderer.updatePreview()
    
    // 最初のボールを生成
    this.game.ballManager.createNextBall()

    // ゲーム開始時にタイマーを開始
    this.game.state.startGame()
  }
}

