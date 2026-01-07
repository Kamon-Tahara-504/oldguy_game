export class GameOverChecker {
  constructor(game) {
    this.game = game
  }

  checkGameOver() {
    // 箱から溢れたボールがあるかチェック
    // ボールの中心が箱の上端より上にある場合のみゲームオーバー
    // currentBallは判定対象外（落下前のボールは箱の外にあるため除外）
    for (const ball of this.game.state.balls) {
      // 落下中でないボールも除外（合体処理中など）
      // 合体直後のボールも除外（位置が確定するまで）
      if (ball.isFalling && !ball.fallComplete && !ball.isMerging) {
        // 落下開始直後（1秒以内）は判定から除外（ボールが箱の上端より上から落下してくるのは正常）
        if (ball.fallStartTime && Date.now() - ball.fallStartTime < 1000) {
          continue
        }
        
        // ボールの中心位置を取得
        const ballCenterY = ball.body.position.y
        
        // ボールの中心が箱の上端より上にある場合のみゲームオーバー
        // かつ、ボールが箱の範囲内（boxLeft ～ boxRight）にある場合
        // これにより、ボールが上端ラインに触れただけではゲームオーバーにならない
        if (ballCenterY < this.game.gameConfig.boxTopY &&
            ball.body.position.x >= this.game.gameConfig.boxLeft && 
            ball.body.position.x <= this.game.gameConfig.boxRight) {
          this.game.gameOver()
          return
        }
      }
    }
  }
}

