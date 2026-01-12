// ボールの位置クランプ処理を共通化するユーティリティ

import { GAME_CONFIG } from '../physics.js'

export class BallPositionClamper {
  /**
   * ボールのX座標を箱の範囲内にクランプする
   * @param {number} x - クランプするX座標
   * @param {number} ballRadius - ボールの半径
   * @param {Object} gameConfig - ゲーム設定オブジェクト（boxLeft, boxRightを含む）
   * @returns {number} クランプされたX座標
   */
  static clampX(x, ballRadius, gameConfig) {
    const boxLeft = gameConfig.boxLeft
    const boxRight = gameConfig.boxRight
    const wallThickness = GAME_CONFIG.WALL_THICKNESS
    
    // ボールが箱の範囲内に収まり、壁に触れないように制限
    return Math.max(
      boxLeft + wallThickness + ballRadius,
      Math.min(
        boxRight - wallThickness - ballRadius,
        x
      )
    )
  }

  /**
   * ボールのY座標を箱の範囲内にクランプする
   * @param {number} y - クランプするY座標
   * @param {number} ballRadius - ボールの半径
   * @param {Object} gameConfig - ゲーム設定オブジェクト（boxTop, boxBottomを含む）
   * @returns {number} クランプされたY座標
   */
  static clampY(y, ballRadius, gameConfig) {
    const boxTop = gameConfig.boxTop || 100
    const boxBottom = gameConfig.boxBottom || gameConfig.groundY
    const wallThickness = GAME_CONFIG.WALL_THICKNESS
    
    // ボールが箱の範囲内に収まり、壁に触れないように制限
    return Math.max(
      boxTop + wallThickness + ballRadius,
      Math.min(
        boxBottom - wallThickness - ballRadius,
        y
      )
    )
  }

  /**
   * ボールの生成位置（箱の上端より上）を計算する
   * @param {number} x - X座標（クランプ前）
   * @param {number} ballRadius - ボールの半径
   * @param {Object} gameConfig - ゲーム設定オブジェクト
   * @returns {Object} {x: number, y: number} クランプされた位置
   */
  static calculateSpawnPosition(x, ballRadius, gameConfig) {
    const clampedX = this.clampX(x, ballRadius, gameConfig)
    const boxTop = gameConfig.boxTop || 100
    const spawnY = boxTop - 50 // 箱の上端より50px上
    
    return {
      x: clampedX,
      y: spawnY
    }
  }
}
