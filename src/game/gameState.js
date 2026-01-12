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
    this.ballDropCooldown = 400 // 400ms（アニメーション時間と統一）
    this.gameStartTime = null // ゲーム開始時刻（タイムスタンプ）
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

  // ゲーム開始時にタイマーを開始
  startGame() {
    this.gameStartTime = Date.now()
  }

  // 経過時間を取得（ミリ秒）
  getElapsedTime() {
    if (!this.gameStartTime) {
      return 0
    }
    return Date.now() - this.gameStartTime
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
    this.gameStartTime = null
  }
}

