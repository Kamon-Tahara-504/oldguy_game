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

  isBallGrounded(ball) {
    const groundY = this.game.gameConfig.groundY
    const ballBottomY = ball.body.position.y + ball.radius
    // 地面に接触しているかどうか（許容誤差10px）
    return ballBottomY >= groundY - 10
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

    // 合体先のレベルを計算
    const newLevel = ball1.level + 1
    if (newLevel > 6) {
      ball1.isMerging = false
      ball2.isMerging = false
      return
    }

    // 新しいボールの半径を取得
    const newRadius = BALL_LEVELS[newLevel].radius

    // 合体位置を計算
    // X座標: 2つのボールの中点
    const mergeX = (ball1.body.position.x + ball2.body.position.x) / 2
    // Y座標: 2つのボールの中点（地面固定ではなく、自然な位置に）
    const mergeY = (ball1.body.position.y + ball2.body.position.y) / 2
    // ただし、地面より下にはならないようにする
    const minY = this.game.gameConfig.groundY - newRadius
    const finalMergeY = Math.max(mergeY, minY)

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
      finalMergeY,
      newLevel,
      this.game.Matter,
      this.game.PIXI
    )
    newBall.isFalling = true // 落下中フラグを設定
    newBall.isMerging = true // 合体直後フラグを設定（ゲームオーバー判定から除外）
    this.game.balls.push(newBall)

    // 合体後のボールが既存のボールと重ならないように位置調整
    this.resolveOverlaps(newBall)

    // 合体直後フラグを次のフレームで解除（位置が確定してから判定に含める）
    setTimeout(() => {
      if (newBall && newBall.body) {
        newBall.isMerging = false
      }
    }, 100)
  }

  resolveOverlaps(newBall) {
    // 既存のボールと重なっているかチェック
    for (const existingBall of this.game.balls) {
      if (existingBall === newBall || !existingBall.body) continue

      const dx = newBall.body.position.x - existingBall.body.position.x
      const dy = newBall.body.position.y - existingBall.body.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const minDistance = newBall.radius + existingBall.radius

      // 重なっている場合、位置を調整
      if (distance < minDistance && distance > 0) {
        const overlap = minDistance - distance
        const angle = Math.atan2(dy, dx)
        
        // 新しいボールを既存のボールから離す方向に移動
        const separationX = Math.cos(angle) * (overlap + 1)
        const separationY = Math.sin(angle) * (overlap + 1)
        
        const newX = newBall.body.position.x + separationX
        const newY = newBall.body.position.y + separationY
        
        // 画面内に収まるように調整
        const clampedX = Math.max(
          newBall.radius,
          Math.min(this.game.gameConfig.width - newBall.radius, newX)
        )
        const clampedY = Math.max(
          newBall.radius,
          Math.min(this.game.gameConfig.groundY - newBall.radius, newY)
        )
        
        this.Matter.Body.setPosition(newBall.body, {
          x: clampedX,
          y: clampedY
        })
      }
    }
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

