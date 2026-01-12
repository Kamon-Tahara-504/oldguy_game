// ボールのアニメーション関連の処理を分離するクラス

export class BallAnimation {
  /**
   * イージング関数（ease-out）
   * @param {number} t - 進行度（0.0-1.0）
   * @returns {number} イージング後の進行度
   */
  static easeOut(t) {
    return 1 - Math.pow(1 - t, 3) // cubic ease-out
  }

  /**
   * スポーンアニメーションを開始
   * @param {Object} ball - ボールオブジェクト（body, graphics, Matterを含む）
   */
  static startSpawnAnimation(ball) {
    ball.isAnimating = true
    ball.animationStartTime = Date.now()
    
    // アニメーション中は衝突を無効化
    ball.Matter.Body.set(ball.body, {
      collisionFilter: {
        group: 0,
        category: 0x0001,
        mask: 0x0000  // 衝突を無効化（maskを0に）
      }
    })
    
    // コンテナ全体をアニメーション（白色ボールと画像の両方）
    ball.graphics.scale.set(0.3)
    ball.graphics.alpha = 0
  }

  /**
   * アニメーションを更新
   * @param {Object} ball - ボールオブジェクト（isAnimating, animationStartTime, animationDuration, graphics, body, Matterを含む）
   */
  static updateAnimation(ball) {
    if (!ball.isAnimating || !ball.animationStartTime) return

    const elapsed = Date.now() - ball.animationStartTime
    const progress = Math.min(elapsed / ball.animationDuration, 1.0)
    const easedProgress = this.easeOut(progress)

    // スケールと透明度を更新（コンテナ全体をアニメーション）
    const scale = 0.3 + (1.0 - 0.3) * easedProgress
    const alpha = 0 + (1.0 - 0) * easedProgress

    ball.graphics.scale.set(scale)
    ball.graphics.alpha = alpha

    // アニメーション完了時
    if (progress >= 1.0) {
      ball.isAnimating = false
      ball.graphics.scale.set(1.0)
      ball.graphics.alpha = 1.0
      
      // 衝突を再有効化
      ball.Matter.Body.set(ball.body, {
        collisionFilter: {
          group: 0,
          category: 0x0001,
          mask: 0xFFFF  // すべてのカテゴリと衝突可能
        }
      })
    }
  }
}
