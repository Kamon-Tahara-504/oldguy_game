// 合体後のボール生成処理を分離するクラス

import { Ball } from '../ball.js'
import { BallPhysicsConfigurator } from '../ball/physicsConfigurator.js'

export class MergedBallCreator {
  /**
   * 合体後のボールを生成する
   * @param {Object} game - ゲームオブジェクト（engine, container, Matter, PIXIを含む）
   * @param {number} mergeX - 合体位置のX座標
   * @param {number} mergeY - 合体位置のY座標
   * @param {number} newLevel - 新しいボールのレベル
   * @param {Object} Matter - Matter.jsライブラリ
   * @param {Object} PIXI - PixiJSライブラリ
   * @returns {Object} 生成されたボールオブジェクト
   */
  static createMergedBall(game, mergeX, mergeY, newLevel, Matter, PIXI) {
    // 新しいボールを作成
    const newBall = new Ball(
      game.engine,
      game.app.stage,
      mergeX,
      mergeY,
      newLevel,
      Matter,
      PIXI
    )

    // 静的ボディとして設定（位置解決後に動的に変更）
    BallPhysicsConfigurator.configureBodyForSpawn(newBall.body, Matter)

    // 位置を設定
    Matter.Body.setPosition(newBall.body, { x: mergeX, y: mergeY })
    newBall.graphics.x = mergeX
    newBall.graphics.y = mergeY

    // 落下状態を設定（合体後のボールは落下中として扱う）
    newBall.isFalling = true
    newBall.fallComplete = false

    return newBall
  }

  /**
   * 合体後のボールを動的ボディに変更する
   * @param {Object} ball - ボールオブジェクト（bodyを含む）
   * @param {Object} Matter - Matter.jsライブラリ
   * @param {number} x - X座標
   * @param {number} y - Y座標
   */
  static activateMergedBall(ball, Matter, x, y) {
    // 動的ボディとして設定（物理エンジン設定処理を共通化）
    BallPhysicsConfigurator.configureBodyForFall(ball.body, Matter, x, y)
  }
}
