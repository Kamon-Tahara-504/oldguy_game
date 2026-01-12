// 壁との衝突処理を分離するクラス

import { GAME_CONFIG } from '../physics.js'

export class WallCollisionResolver {
  /**
   * 壁との衝突を解決する
   * @param {Object} ball - ボールオブジェクト（body, radiusを含む）
   * @param {Object} gameConfig - ゲーム設定オブジェクト（boxLeft, boxRight, boxTop, boxBottomを含む）
   * @param {Object} Matter - Matter.jsライブラリ
   * @returns {Object} {x: number, y: number} 調整後の位置
   */
  static resolveWallCollisions(ball, gameConfig, Matter) {
    const body = ball.body
    const radius = ball.radius
    const wallThickness = GAME_CONFIG.WALL_THICKNESS
    
    let currentX = body.position.x
    let currentY = body.position.y
    
    // 左の壁との衝突
    const boxLeft = gameConfig.boxLeft
    if (currentX - radius < boxLeft + wallThickness) {
      currentX = boxLeft + wallThickness + radius
    }
    
    // 右の壁との衝突
    const boxRight = gameConfig.boxRight
    if (currentX + radius > boxRight - wallThickness) {
      currentX = boxRight - wallThickness - radius
    }
    
    // 上端との衝突
    const boxTop = gameConfig.boxTop
    if (currentY - radius < boxTop) {
      currentY = boxTop + radius
    }
    
    // 下端（地面）との衝突
    const boxBottom = gameConfig.boxBottom || gameConfig.groundY
    if (currentY + radius > boxBottom) {
      currentY = boxBottom - radius
    }
    
    return {
      x: currentX,
      y: currentY
    }
  }
}
