// メインのRendererクラス（各Rendererを統合）

import { UIRenderer } from './renderers/uiRenderer.js'
import { GameOverRenderer } from './renderers/gameOverRenderer.js'
import { PreviewRenderer } from './renderers/previewRenderer.js'
import { BoxRenderer } from './renderers/boxRenderer.js'
import { TrajectoryRenderer } from './renderers/trajectoryRenderer.js'
import { CloudRenderer } from './renderers/cloudRenderer.js'

export class Renderer {
  constructor(game, app, PIXI) {
    this.game = game
    this.app = app
    this.PIXI = PIXI
    
    // 各Rendererを初期化
    this.uiRenderer = new UIRenderer(game, app, PIXI)
    this.gameOverRenderer = new GameOverRenderer(game, app, PIXI)
    this.previewRenderer = new PreviewRenderer(game, app, PIXI)
    this.boxRenderer = new BoxRenderer(game, app, PIXI)
    this.trajectoryRenderer = new TrajectoryRenderer(game, app, PIXI)
    this.cloudRenderer = new CloudRenderer(game, app, PIXI)
  }

  // 地面と壁の描画を初期化
  initGroundAndWalls(walls) {
    this.boxRenderer.init(walls)
    // 雲を初期化（背景の上に配置される）
    this.cloudRenderer.init()
  }

  // スコア表示を初期化
  initScore() {
    this.uiRenderer.init()
  }

  // スコア表示を更新
  updateScore() {
    this.uiRenderer.update()
  }

  // プレビューを更新
  updatePreview() {
    this.previewRenderer.update()
  }

  // ゲームオーバーメッセージを表示
  showGameOver() {
    this.gameOverRenderer.show()
  }

  // 落下軌道を更新
  updateTrajectory() {
    this.trajectoryRenderer.update()
  }

  // 雲を更新
  updateClouds() {
    this.cloudRenderer.update()
  }
}
