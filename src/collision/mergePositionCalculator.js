// 合体位置の計算を分離するクラス

export class MergePositionCalculator {
  /**
   * 合体位置を計算する
   * @param {Object} ball1 - 1つ目のボール（body.positionを含む）
   * @param {Object} ball2 - 2つ目のボール（body.positionを含む）
   * @param {number} newRadius - 新しいボールの半径
   * @param {Object} gameConfig - ゲーム設定オブジェクト（boxLeft, boxRight, boxTop, boxBottomを含む）
   * @param {Object} positionResolver - PositionResolverインスタンス（findValidMergePositionを使用）
   * @returns {Object} {x: number, y: number} 合体位置
   */
  static calculateMergePosition(ball1, ball2, newRadius, gameConfig, positionResolver) {
    // 箱の範囲を取得
    const boxLeft = gameConfig.boxLeft
    const boxRight = gameConfig.boxRight
    const boxTop = gameConfig.boxTop
    const boxBottom = gameConfig.boxBottom || gameConfig.groundY

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
    mergeY = positionResolver.findValidMergePosition(mergeX, mergeY, newRadius, ball1, ball2)

    return {
      x: mergeX,
      y: mergeY
    }
  }
}
