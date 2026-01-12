// 物理ボディの設定処理を分離するクラス

export class BallPhysicsConfigurator {
  /**
   * ボールのBodyを静的ボディとして設定（スポーン時）
   * @param {Object} body - Matter.jsのBodyオブジェクト
   * @param {Object} Matter - Matter.jsライブラリ
   */
  static configureBodyForSpawn(body, Matter) {
    Matter.Body.setStatic(body, true)
  }

  /**
   * ボールのBodyを動的ボディとして設定（落下時）
   * @param {Object} body - Matter.jsのBodyオブジェクト
   * @param {Object} Matter - Matter.jsライブラリ
   * @param {number} x - X座標
   * @param {number} y - Y座標
   */
  static configureBodyForFall(body, Matter, x, y) {
    // まず静的ボディから動的ボディに変更（変換時に位置がリセットされる可能性があるため）
    Matter.Body.setStatic(body, false)
    
    // 変換後、位置を確実に設定（複数回設定して確実にする）
    Matter.Body.setPosition(body, { x, y })
    
    // Bodyの速度と角速度を0にリセット
    Matter.Body.setVelocity(body, { x: 0, y: 0 })
    Matter.Body.setAngularVelocity(body, 0)
    
    // 重力を有効化
    Matter.Body.set(body, { gravityScale: 1 })
    
    // Bodyの位置を再度設定（確実にするため）
    Matter.Body.setPosition(body, { x, y })
    
    // Bodyをスリープ状態から解除（スリープしていると動かない）
    Matter.Body.set(body, { sleepThreshold: Infinity })
    Matter.Sleeping.set(body, false)
  }

  /**
   * ボールのBodyの位置と速度をリセット（落下前のボール用）
   * @param {Object} body - Matter.jsのBodyオブジェクト
   * @param {Object} Matter - Matter.jsライブラリ
   * @param {number} x - X座標
   * @param {number} y - Y座標
   */
  static resetBodyPositionAndVelocity(body, Matter, x, y) {
    // 静的ボディとして確実に設定
    Matter.Body.setStatic(body, true)
    // Graphicsの位置をBodyに反映
    Matter.Body.setPosition(body, { x, y })
    // 速度を0にリセット
    Matter.Body.setVelocity(body, { x: 0, y: 0 })
    Matter.Body.setAngularVelocity(body, 0)
  }
}
