export class PositionResolver {
  constructor(game, Matter) {
    this.game = game
    this.Matter = Matter
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

    // 既存のボールと重なっているかチェック（ボールとの衝突処理を分離）
    const ballResolvedPosition = BallCollisionResolver.resolveBallCollisions(
      newBall,
      this.game.balls,
      this.game.Matter
    )
    if (ballResolvedPosition.needsAdjustment) {
      needsAdjustment = true
      currentX = ballResolvedPosition.x
      currentY = ballResolvedPosition.y
    }

    // 壁との衝突をチェック（壁との衝突処理を分離）
    const wallResolvedPosition = WallCollisionResolver.resolveWallCollisions(
      newBall,
      this.game.gameConfig,
      this.game.Matter
    )
    if (wallResolvedPosition.x !== currentX || wallResolvedPosition.y !== currentY) {
      needsAdjustment = true
      currentX = wallResolvedPosition.x
      currentY = wallResolvedPosition.y
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
}

