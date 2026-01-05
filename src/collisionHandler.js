import { Ball } from './ball.js'
import { BALL_LEVELS, ASCEND_SCORE } from './physics.js'

export class CollisionHandler {
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
          this.mergeBalls(ballA, ballB)
        }
      }
    }
  }

  mergeBalls(ball1, ball2) {
    // 合体処理中フラグを設定
    ball1.isMerging = true
    ball2.isMerging = true

    // 高齢の顔（レベル6）同士の合体の場合は昇天エフェクト
    if (ball1.level === 6 && ball2.level === 6) {
      this.ascendEffect(ball1, ball2)
      return
    }

    // 合体位置を計算
    const mergeX = (ball1.body.position.x + ball2.body.position.x) / 2
    const mergeY = Math.max(ball1.body.position.y, ball2.body.position.y)

    // 合体先のレベルを計算
    const newLevel = ball1.level + 1
    if (newLevel > 6) {
      ball1.isMerging = false
      ball2.isMerging = false
      return
    }

    // スコア加算
    const scoreToAdd = BALL_LEVELS[newLevel].score
    this.game.addScore(scoreToAdd)

    // 元のボールを破棄
    this.game.ballManager.removeBall(ball1)
    this.game.ballManager.removeBall(ball2)

    // 新しいレベルのボールを生成
    const newBall = new Ball(
      this.game.engine,
      this.game.app.stage,
      mergeX,
      mergeY,
      newLevel,
      this.game.Matter,
      this.game.PIXI
    )
    newBall.isFalling = true // 落下中フラグを設定
    this.game.balls.push(newBall)
  }

  ascendEffect(ball1, ball2) {
    // スコア加算
    this.game.addScore(ASCEND_SCORE)

    // 昇天アニメーション（簡易版：PixiJSのtickerを使用）
    const ascendSpeed = 5
    const ascendDuration = 60 // フレーム数
    let frame = 0

    const animateAscend = () => {
      frame++
      if (frame < ascendDuration) {
        if (ball1.body && ball2.body) {
          this.Matter.Body.setPosition(ball1.body, {
            x: ball1.body.position.x,
            y: ball1.body.position.y - ascendSpeed
          })
          this.Matter.Body.setPosition(ball2.body, {
            x: ball2.body.position.x,
            y: ball2.body.position.y - ascendSpeed
          })
        }
      } else {
        // アニメーション完了後、ボールを破棄
        this.game.ballManager.removeBall(ball1)
        this.game.ballManager.removeBall(ball2)
        // アニメーション終了時にtickerから削除
        this.game.app.ticker.remove(animateAscend)
      }
    }

    // アニメーションをtickerに追加
    this.game.app.ticker.add(animateAscend)
  }
}

