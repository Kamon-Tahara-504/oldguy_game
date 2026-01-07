export class CollisionDetector {
  constructor(game, Matter) {
    this.game = game
    this.Matter = Matter
  }

  handleCollision(event) {
    if (this.game.isGameOver) return

    const pairs = event.pairs

    for (const pair of pairs) {
      const { bodyA, bodyB } = pair

      // 地面や壁との衝突は無視
      if (bodyA === this.game.ground || bodyB === this.game.ground) {
        continue
      }
      if (this.game.walls.includes(bodyA) || this.game.walls.includes(bodyB)) {
        continue
      }

      // ボール同士の衝突を処理
      const ballA = this.game.balls.find(b => b.body === bodyA)
      const ballB = this.game.balls.find(b => b.body === bodyB)

      if (ballA && ballB && !ballA.isMerging && !ballB.isMerging) {
        // 同じレベルなら合体
        if (ballA.level === ballB.level) {
          // mergeBalls は外部から注入されるコールバックを使用
          if (this.onBallCollision) {
            this.onBallCollision(ballA, ballB)
          }
        }
      }
    }
  }

  isBallGrounded(ball) {
    const groundY = this.game.gameConfig.groundY
    const ballBottomY = ball.body.position.y + ball.radius
    // 地面に接触しているかどうか（許容誤差10px）
    return ballBottomY >= groundY - 10
  }
}

