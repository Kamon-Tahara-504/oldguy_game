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
    mergeY = this.findValidMergePosition(mergeX, mergeY, newRadius, ball1, ball2)

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
    this.resolveOverlaps(newBall)
    
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

  // 合体位置が既存のボールと重ならないように、適切な位置を探索
  findValidMergePosition(mergeX, mergeY, newRadius, ball1, ball2) {
    const boxLeft = this.game.gameConfig.boxLeft
    const boxRight = this.game.gameConfig.boxRight
    const boxTop = this.game.gameConfig.boxTop
    const boxBottom = this.game.gameConfig.boxBottom || this.game.gameConfig.groundY
    
    // 既存のボール（合体する2つのボールを除く）を取得
    const existingBalls = this.game.balls.filter(
      b => b !== ball1 && b !== ball2 && b.body
    )
    
    // 合体位置が既存のボールと重なっているかチェック
    let hasOverlap = false
    for (const existingBall of existingBalls) {
      const dx = mergeX - existingBall.body.position.x
      const dy = mergeY - existingBall.body.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const minDistance = newRadius + existingBall.radius
      
      if (distance < minDistance) {
        hasOverlap = true
        break
      }
    }
    
    // 重なっていない場合、そのまま返す
    if (!hasOverlap) {
      return mergeY
    }
    
    // 重なっている場合、上方向に優先的に移動して、適切な位置を探索
    let bestY = mergeY
    let attempts = 0
    const maxAttempts = 30
    const stepSize = newRadius * 0.3
    
    // 上方向に移動して、既存のボールと重ならない位置を探す
    while (attempts < maxAttempts) {
      let foundOverlap = false
      
      // 既存のボールと重なっているかチェック
      for (const existingBall of existingBalls) {
        const dx = mergeX - existingBall.body.position.x
        const dy = bestY - existingBall.body.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDistance = newRadius + existingBall.radius
        
        if (distance < minDistance) {
          foundOverlap = true
          break
        }
      }
      
      // 重なっていない場合、この位置を使用
      if (!foundOverlap) {
        // 箱の範囲内に収める
        const clampedY = Math.max(
          boxTop + newRadius,
          Math.min(boxBottom - newRadius, bestY)
        )
        return clampedY
      }
      
      // 重なっている場合、上方向に移動
      bestY = bestY - stepSize
      attempts++
      
      // 箱の上端より上になったら、元の位置より少し上に配置
      if (bestY < boxTop + newRadius) {
        // 元の位置より少し上に配置（地面に近づかないように）
        bestY = Math.max(boxTop + newRadius, mergeY - newRadius * 0.5)
        break
      }
    }
    
    // 最終的に箱の範囲内に収める（地面に近づかないように）
    const finalY = Math.max(
      boxTop + newRadius,
      Math.min(boxBottom - newRadius, Math.min(bestY, mergeY)) // 元の位置より下には移動しない
    )
    return finalY
  }

  resolveOverlaps(newBall) {
    // 箱の範囲を取得
    const boxLeft = this.game.gameConfig.boxLeft
    const boxRight = this.game.gameConfig.boxRight
    const boxTop = this.game.gameConfig.boxTop
    const boxBottom = this.game.gameConfig.boxBottom || this.game.gameConfig.groundY
    const newRadius = newBall.radius
    
    let currentX = newBall.body.position.x
    let currentY = newBall.body.position.y
    let needsAdjustment = false

    // 既存のボールと重なっているかチェック
    for (const existingBall of this.game.balls) {
      if (existingBall === newBall || !existingBall.body) continue

      const dx = currentX - existingBall.body.position.x
      const dy = currentY - existingBall.body.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const minDistance = newRadius + existingBall.radius

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

    // 壁との衝突をチェック
    // 左の壁
    if (currentX - newRadius < boxLeft) {
      needsAdjustment = true
      currentX = boxLeft + newRadius
    }
    // 右の壁
    if (currentX + newRadius > boxRight) {
      needsAdjustment = true
      currentX = boxRight - newRadius
    }
    // 上端（箱の上端より上にはならない）
    if (currentY - newRadius < boxTop) {
      needsAdjustment = true
      currentY = boxTop + newRadius
    }
    // 下端（地面より下にはならない）
    if (currentY + newRadius > boxBottom) {
      needsAdjustment = true
      currentY = boxBottom - newRadius
    }

    // 位置調整が必要な場合、箱の範囲内に確実に収める
    if (needsAdjustment) {
      const clampedX = Math.max(
        boxLeft + newRadius,
        Math.min(boxRight - newRadius, currentX)
      )
      // Y座標は、地面に近づかないように制限（元の位置より下に移動しない）
      const originalY = newBall.body.position.y
      const clampedY = Math.max(
        boxTop + newRadius,
        Math.min(
          Math.min(boxBottom - newRadius, originalY), // 元の位置より下には移動しない
          currentY
        )
      )
      
      this.Matter.Body.setPosition(newBall.body, {
        x: clampedX,
        y: clampedY
      })
      
      // Graphicsの位置も同期
      if (newBall.graphics) {
        newBall.graphics.x = clampedX
        newBall.graphics.y = clampedY
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

