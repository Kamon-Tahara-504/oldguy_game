import { Ball } from '../ball.js'
import { BALL_LEVELS, ASCEND_SCORE } from '../physics.js'
import { MergePositionCalculator } from './mergePositionCalculator.js'
import { MergedBallCreator } from './mergedBallCreator.js'

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

    // 合体位置を計算（合体位置計算処理を分離）
    const mergePosition = MergePositionCalculator.calculateMergePosition(
      ball1,
      ball2,
      newRadius,
      this.game.gameConfig,
      this.positionResolver
    )
    const mergeX = mergePosition.x
    const mergeY = mergePosition.y

    // スコア加算
    const scoreToAdd = BALL_LEVELS[newLevel].score
    this.game.addScore(scoreToAdd)

    // 元のボールを破棄
    this.game.ballManager.removeBall(ball1)
    this.game.ballManager.removeBall(ball2)

    // 新しいレベルのボールを生成
    // 新しいボールを作成（合体後のボール生成処理を分離）
    const newBall = MergedBallCreator.createMergedBall(
      this.game,
      mergeX,
      mergeY,
      newLevel,
      this.game.Matter,
      this.game.PIXI
    )
    
    newBall.isMerging = true // 合体直後フラグを設定（ゲームオーバー判定から除外）
    newBall.fallStartTime = Date.now() // 落下開始時刻を記録（合体後のボールも落下中）
    this.game.balls.push(newBall)

    // 合体後のボールが既存のボールと重ならないように位置調整
    this.positionResolver.resolveOverlaps(newBall)
    
    // 位置が確定したら、動的ボディに変更して重力を有効化（合体後のボール生成処理を分離）
    const finalX = newBall.body.position.x
    const finalY = newBall.body.position.y
    MergedBallCreator.activateMergedBall(newBall, this.game.Matter, finalX, finalY)
    
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

    // 合体位置を計算（2つのボールの中点）
    const mergeX = (ball1.body.position.x + ball2.body.position.x) / 2
    const mergeY = (ball1.body.position.y + ball2.body.position.y) / 2

    // エフェクトレンダラーを使用して昇天エフェクトを開始
    if (this.game.renderer && this.game.renderer.ascendEffectRenderer) {
      this.game.renderer.ascendEffectRenderer.startAscend(mergeX, mergeY)
    }

    // ボールを即座に削除（エフェクトが表示されるため）
    this.game.ballManager.removeBall(ball1)
    this.game.ballManager.removeBall(ball2)
  }
}

