import { Ball } from '../ball.js'
import { BALL_LEVELS, ASCEND_SCORE } from '../physics.js'

export class BallMerger {
  constructor(game, Matter, positionResolver) {
    this.game = game
    this.Matter = Matter
    this.positionResolver = positionResolver
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

    // 箱の範囲を取得
    const boxLeft = this.game.gameConfig.boxLeft
    const boxRight = this.game.gameConfig.boxRight
    const boxTop = this.game.gameConfig.boxTop
    const boxBottom = this.game.gameConfig.boxBottom || this.game.gameConfig.groundY

    // 合体位置を計算
    // X座標: 2つのボールの中点（箱の範囲内に収める）
    let mergeX = (ball1.body.position.x + ball2.body.position.x) / 2
    mergeX = Math.max(
      boxLeft + newRadius,
      Math.min(boxRight - newRadius, mergeX)
    )
    
    // Y座標: 2つのボールの中点（自然な位置）
    let mergeY = (ball1.body.position.y + ball2.body.position.y) / 2
    
    // 箱の範囲内に収める
    const minY = boxTop + newRadius // 箱の上端より上にはならない
    const maxY = boxBottom - newRadius // 地面より下にはならない
    mergeY = Math.max(minY, Math.min(maxY, mergeY))
    
    // 合体位置が既存のボールと重ならないように、適切な位置を探索
    mergeY = this.positionResolver.findValidMergePosition(mergeX, mergeY, newRadius, ball1, ball2)

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
    
    // 合体直後は一時的に静的ボディとして設定（位置が確定するまで）
    this.Matter.Body.setStatic(newBall.body, true)
    
    // 位置を確実に設定
    this.Matter.Body.setPosition(newBall.body, { x: mergeX, y: mergeY })
    
    // Graphicsの位置も同期
    newBall.graphics.x = mergeX
    newBall.graphics.y = mergeY
    
    newBall.isFalling = true // 落下中フラグを設定
    newBall.isMerging = true // 合体直後フラグを設定（ゲームオーバー判定から除外）
    newBall.fallStartTime = Date.now() // 落下開始時刻を記録（合体後のボールも落下中）
    this.game.balls.push(newBall)

    // 合体後のボールが既存のボールと重ならないように位置調整
    this.positionResolver.resolveOverlaps(newBall)
    
    // 位置が確定したら、動的ボディに変更して重力を有効化
    // 速度と角速度を0にリセット
    this.Matter.Body.setVelocity(newBall.body, { x: 0, y: 0 })
    this.Matter.Body.setAngularVelocity(newBall.body, 0)
    
    // 静的ボディから動的ボディに変更
    this.Matter.Body.setStatic(newBall.body, false)
    
    // 重力を有効化
    this.Matter.Body.set(newBall.body, { gravityScale: 1 })
    
    // 位置を再度設定（確実にするため）
    const finalX = newBall.body.position.x
    const finalY = newBall.body.position.y
    this.Matter.Body.setPosition(newBall.body, { x: finalX, y: finalY })
    
    // Graphicsの位置も同期
    newBall.graphics.x = finalX
    newBall.graphics.y = finalY

    // 合体直後フラグを次のフレームで解除（位置が確定してから判定に含める）
    setTimeout(() => {
      if (newBall && newBall.body) {
        newBall.isMerging = false
      }
    }, 100)
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

