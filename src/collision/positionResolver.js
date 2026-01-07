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
}

