// update()メソッドの責務を分離するクラス

export class GameUpdater {
  /**
   * すべてのボールの位置を同期
   * @param {Object} game - ゲームオブジェクト（stateを含む）
   */
  static updateBalls(game) {
    game.state.balls.forEach(ball => {
      ball.update()
    })
  }

  /**
   * 現在のボールの位置を同期
   * @param {Object} game - ゲームオブジェクト（stateを含む）
   */
  static updateCurrentBall(game) {
    if (game.state.currentBall) {
      // 落下前のボールはGraphicsの位置でBodyを制御（Ball.update()で処理）
      game.state.currentBall.update()
      
      // アニメーションを更新
      if (game.state.currentBall.isAnimating) {
        game.state.currentBall.updateAnimation()
      }
    }
  }

  /**
   * 落下軌道を更新
   * @param {Object} game - ゲームオブジェクト（state, rendererを含む）
   */
  static updateTrajectory(game) {
    // 落下軌道を更新（ボールが落下していない時のみ）
    if (game.state.currentBall && !game.state.currentBall.isFalling && !game.state.isGameOver) {
      game.renderer.updateTrajectory()
    }
  }

  /**
   * エフェクトを更新（雲と昇天エフェクト）
   * @param {Object} game - ゲームオブジェクト（rendererを含む）
   */
  static updateEffects(game) {
    // 雲を更新（パララックス効果）
    game.renderer.updateClouds()
    
    // 昇天エフェクトを更新
    game.renderer.updateAscendEffect()
  }

  /**
   * fallCompleteフラグを更新
   * @param {Object} game - ゲームオブジェクト（state, gameConfigを含む）
   */
  static updateFallComplete(game) {
    // 落下中のボールのfallCompleteフラグを更新（合体後のボール用）
    // 注: fallCompleteは物理エンジンの動作を妨げないフラグとして使用
    // ボールが完全に停止するまで待つ（より緩和した条件）
    for (const ball of game.state.balls) {
      if (ball.isFalling && !ball.fallComplete) {
        const body = ball.body
        const velocity = Math.abs(body.velocity.x) + Math.abs(body.velocity.y)
        const angularVelocity = Math.abs(body.angularVelocity)
        const isGrounded = body.position.y >= game.gameConfig.groundY - ball.radius - 10
        
        // 速度と角速度が非常に小さい場合（ほぼ完全停止）かつ地面に到達している場合のみ、落下完了とみなす
        // 値は0.05に下げて、より完全に停止するまで待つ
        // ただし、fallComplete後も物理エンジンの影響を受け続ける（ball.jsのupdate関数で処理）
        if (velocity < 0.05 && angularVelocity < 0.05 && isGrounded) {
          ball.fallComplete = true
          // isFallingはtrueのままにしておく（物理エンジンの動作を妨げないため）
        }
      }
    }
  }

  /**
   * UIを更新（スコア、時間表示など）
   * @param {Object} game - ゲームオブジェクト（rendererを含む）
   */
  static updateUI(game) {
    // UI表示を更新（スコア、時間表示など）
    game.renderer.updateScore()
  }

  /**
   * すべての更新処理を実行
   * @param {Object} game - ゲームオブジェクト
   */
  static update(game) {
    this.updateBalls(game)
    this.updateCurrentBall(game)
    this.updateTrajectory(game)
    this.updateEffects(game)
    
    // UIを更新（毎フレーム更新されるため、時間表示も更新される）
    this.updateUI(game)
    
    // UI要素を最前面に配置（ボールより前面に表示）
    game.renderer.ensureUIFront()
    
    this.updateFallComplete(game)
  }
}
