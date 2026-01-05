// ゲーム状態の管理（スコア、ハイスコア、ボールレベルなど）

import { loadHighScore, saveHighScore } from '../utils/storage.js'

export class GameState {
  constructor() {
    this.balls = []
    this.currentBall = null
    this.nextBallLevel = 1
    this.nextNextBallLevel = Math.floor(Math.random() * 4) + 1 // 次の次のボールのレベル（1-4レベル）
    this.isDragging = false
    this.score = 0
    this.isGameOver = false
    // ハイスコアをlocalStorageから読み込み
    this.highScore = loadHighScore()
    this.lastBallDropTime = 0
    this.ballDropCooldown = 1000 // 1秒
  }

  // スコアを追加
  addScore(points) {
    this.score += points
  }

  // ゲームオーバー時の処理
  onGameOver() {
    this.isGameOver = true
    // ハイスコアを更新
    if (this.score > this.highScore) {
      this.highScore = this.score
      saveHighScore(this.highScore)
    }
  }

  // 状態をリセット
  reset() {
    this.balls = []
    this.currentBall = null
    this.score = 0
    this.isGameOver = false
    this.nextBallLevel = 1
    this.nextNextBallLevel = Math.floor(Math.random() * 4) + 1
    this.lastBallDropTime = 0
  }
}

