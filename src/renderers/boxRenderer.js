// 箱・壁・地面の描画

export class BoxRenderer {
  constructor(game, app, PIXI) {
    this.game = game
    this.app = app
    this.PIXI = PIXI
    this.backgroundGraphics = null
    this.groundGraphics = null
    this.groundShadow = null
    this.wallGraphics = []
    this.wallShadows = []
    this.boxTopGraphics = null
  }

  // 地面と壁の描画を初期化
  init(walls) {
    // 既存の描画をクリーンアップ
    this.cleanup()
    
    // 背景にグラデーションを追加
    this.drawGradientBackground()
    // 箱の範囲を取得
    const boxLeft = this.game.gameConfig.boxLeft
    const boxRight = this.game.gameConfig.boxRight
    const boxTop = this.game.gameConfig.boxTop
    const boxBottom = this.game.gameConfig.boxBottom || this.game.gameConfig.groundY
    const wallThickness = 20

    // 箱の上端ラインを描画（視覚的な境界線のみ、物理的な壁はなし）
    this.boxTopGraphics = new this.PIXI.Graphics()
    this.boxTopGraphics.lineStyle(2, 0x95a5a6, 0.4) // 薄いグレー、太さ2px、透明度0.4
    this.boxTopGraphics.moveTo(boxLeft, boxTop)
    this.boxTopGraphics.lineTo(boxRight, boxTop)
    this.app.stage.addChild(this.boxTopGraphics)

    // 箱の底面（地面）を描画
    this.groundGraphics = new this.PIXI.Graphics()
    
    // 地面の影
    this.groundShadow = new this.PIXI.Graphics()
    this.groundShadow.beginFill(0x000000, 0.15)
    this.groundShadow.drawRect(boxLeft, boxBottom - 8, boxRight - boxLeft, 18)
    this.groundShadow.endFill()
    this.app.stage.addChild(this.groundShadow)
    
    // 地面のグラデーション（簡易版）
    this.groundGraphics.beginFill(0xecf0f1) // ライトグレー
    this.groundGraphics.drawRect(boxLeft, boxBottom - 10, boxRight - boxLeft, 20)
    this.groundGraphics.endFill()
    
    // 地面の上端に薄いライン
    this.groundGraphics.lineStyle(1, 0xbdc3c7, 0.5) // 薄いグレー
    this.groundGraphics.moveTo(boxLeft, boxBottom - 10)
    this.groundGraphics.lineTo(boxRight, boxBottom - 10)
    this.app.stage.addChild(this.groundGraphics)

    // 箱の側面（左右の壁）を描画
    this.wallShadows = []
    walls.forEach((wall, index) => {
      const wallGraphics = new this.PIXI.Graphics()
      
      // 壁の影
      const wallShadow = new this.PIXI.Graphics()
      wallShadow.beginFill(0x000000, 0.1)
      wallShadow.drawRect(
        wall.bounds.min.x + 2,
        wall.bounds.min.y + 2,
        wall.bounds.max.x - wall.bounds.min.x,
        wall.bounds.max.y - wall.bounds.min.y
      )
      wallShadow.endFill()
      this.app.stage.addChild(wallShadow)
      this.wallShadows.push(wallShadow)
      
      wallGraphics.beginFill(0xecf0f1) // ライトグレー
      wallGraphics.lineStyle(1, 0xbdc3c7, 0.3) // 薄い境界線
      wallGraphics.drawRect(
        wall.bounds.min.x,
        wall.bounds.min.y,
        wall.bounds.max.x - wall.bounds.min.x,
        wall.bounds.max.y - wall.bounds.min.y
      )
      wallGraphics.endFill()
      this.app.stage.addChild(wallGraphics)
      this.wallGraphics.push(wallGraphics)
    })
  }

  // 既存の描画をクリーンアップ
  cleanup() {
    // 上端ラインを削除
    if (this.boxTopGraphics) {
      if (this.boxTopGraphics.parent) {
        this.app.stage.removeChild(this.boxTopGraphics)
      }
      this.boxTopGraphics.destroy()
      this.boxTopGraphics = null
    }

    // 地面の影を削除
    if (this.groundShadow) {
      if (this.groundShadow.parent) {
        this.app.stage.removeChild(this.groundShadow)
      }
      this.groundShadow.destroy()
      this.groundShadow = null
    }

    // 地面を削除
    if (this.groundGraphics) {
      if (this.groundGraphics.parent) {
        this.app.stage.removeChild(this.groundGraphics)
      }
      this.groundGraphics.destroy()
      this.groundGraphics = null
    }

    // 壁の影を削除
    this.wallShadows.forEach(wallShadow => {
      if (wallShadow && wallShadow.parent) {
        this.app.stage.removeChild(wallShadow)
        wallShadow.destroy()
      }
    })
    this.wallShadows = []

    // 壁を削除
    this.wallGraphics.forEach(wallGraphics => {
      if (wallGraphics && wallGraphics.parent) {
        this.app.stage.removeChild(wallGraphics)
        wallGraphics.destroy()
      }
    })
    this.wallGraphics = []
  }

  // グラデーション背景を描画
  drawGradientBackground() {
    // 既存の背景を削除
    if (this.backgroundGraphics) {
      if (this.backgroundGraphics.parent) {
        this.app.stage.removeChild(this.backgroundGraphics)
      }
      this.backgroundGraphics.destroy()
    }

    // グラデーション背景を作成（複数の矩形でグラデーション効果を実現）
    this.backgroundGraphics = new this.PIXI.Graphics()
    
    const width = this.game.gameConfig.width
    const height = this.game.gameConfig.height
    const steps = 100 // グラデーションのステップ数
    
    // 上から下へのグラデーション（濃い青から薄い青へ）
    const startColor = { r: 100, g: 180, b: 240 } // スカイブルー（より濃い青）
    const endColor = { r: 173, g: 216, b: 250 } // ライトブルー（薄い青、白ではなく）
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps
      const r = Math.floor(startColor.r + (endColor.r - startColor.r) * ratio)
      const g = Math.floor(startColor.g + (endColor.g - startColor.g) * ratio)
      const b = Math.floor(startColor.b + (endColor.b - startColor.b) * ratio)
      const color = (r << 16) | (g << 8) | b
      
      const y = (height / steps) * i
      const rectHeight = height / steps + 1 // 少し重ねて滑らかに
      
      this.backgroundGraphics.beginFill(color, 1.0)
      this.backgroundGraphics.drawRect(0, y, width, rectHeight)
      this.backgroundGraphics.endFill()
    }
    
    // 背景を最背面に配置
    this.app.stage.addChildAt(this.backgroundGraphics, 0)
  }
}

