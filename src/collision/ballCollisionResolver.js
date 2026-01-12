// ボールとの衝突処理を分離するクラス

export class BallCollisionResolver {
  /**
   * ボールとの衝突を解決する
   * @param {Object} ball - ボールオブジェクト（body, radiusを含む）
   * @param {Array} otherBalls - 他のボールの配列
   * @param {Object} Matter - Matter.jsライブラリ
   * @returns {Object} {x: number, y: number, needsAdjustment: boolean} 調整後の位置と調整が必要かどうか
   */
  static resolveBallCollisions(ball, otherBalls, Matter) {
    let currentX = ball.body.position.x
    let currentY = ball.body.position.y
    let needsAdjustment = false
    const ballRadius = ball.radius

    // 既存のボールと重なっているかチェック
    for (const existingBall of otherBalls) {
      if (existingBall === ball || !existingBall.body) continue

      const dx = currentX - existingBall.body.position.x
      const dy = currentY - existingBall.body.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const minDistance = ballRadius + existingBall.radius

      // 重なっている場合、位置を調整
      if (distance < minDistance && distance > 0) {
        needsAdjustment = true
        const overlap = minDistance - distance
        
        // 上方向に優先的に移動させる
        // 既存のボールが新しいボールより上にある場合（dy < 0）、上方向に移動
        // 既存のボールが新しいボールより下にある場合（dy > 0）、上方向に移動を優先
        let separationX = 0
        let separationY = 0
        
        if (Math.abs(dy) > Math.abs(dx)) {
          // Y方向の距離が大きい場合、上方向に移動を優先
          separationY = -Math.abs(overlap + 2) // 上方向（負の値）
          // X方向は少し調整
          if (Math.abs(dx) > 0.1) {
            separationX = (dx / Math.abs(dy)) * Math.abs(separationY) * 0.3
          }
        } else {
          // X方向の距離が大きい場合でも、上方向への移動を優先
          const angle = Math.atan2(dy, dx)
          separationX = Math.cos(angle) * (overlap + 2)
          // Y方向は上方向に優先的に移動（既存のボールより上にある場合は上に、下にある場合も上に）
          separationY = -Math.abs(Math.sin(angle)) * (overlap + 2)
        }
        
        currentX = currentX + separationX
        currentY = currentY + separationY
      }
    }

    return {
      x: currentX,
      y: currentY,
      needsAdjustment: needsAdjustment
    }
  }
}
