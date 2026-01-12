// 物理エンジン更新前の処理を分離するクラス

import { BallPhysicsConfigurator } from '../ball/physicsConfigurator.js'

export class PhysicsUpdater {
  /**
   * 物理エンジン更新前の準備処理
   * @param {Object} game - ゲームオブジェクト（state, Matterを含む）
   */
  static preparePhysicsUpdate(game) {
    // 落下前のボールの位置と速度をリセット
    if (game.state.currentBall && !game.state.currentBall.isFalling) {
      const ball = game.state.currentBall
      // 位置と速度をリセット（物理エンジン設定処理を共通化）
      BallPhysicsConfigurator.resetBodyPositionAndVelocity(
        ball.body,
        game.Matter,
        ball.graphics.x,
        ball.graphics.y
      )
      
      // アニメーション中は衝突を無効化（念のため）
      if (ball.isAnimating) {
        game.Matter.Body.set(ball.body, {
          collisionFilter: {
            group: 0,
            category: 0x0001,
            mask: 0x0000  // 衝突を無効化
          }
        })
      }
    }
  }
}
