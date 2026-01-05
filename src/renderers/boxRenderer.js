// 箱・壁・地面の描画

export class BoxRenderer {
  constructor(game, app, PIXI) {
    this.game = game
    this.app = app
    this.PIXI = PIXI
    this.groundGraphics = null
    this.wallGraphics = []
    this.boxTopGraphics = null
  }

  // 地面と壁の描画を初期化
  init(walls) {
    // 箱の範囲を取得
    const boxLeft = this.game.gameConfig.boxLeft
    const boxRight = this.game.gameConfig.boxRight
    const boxTop = this.game.gameConfig.boxTop
    const boxBottom = this.game.gameConfig.boxBottom || this.game.gameConfig.groundY
    const wallThickness = 20

    // 箱の上端ラインを描画（視覚的な境界線のみ、物理的な壁はなし）
    this.boxTopGraphics = new this.PIXI.Graphics()
    this.boxTopGraphics.lineStyle(4, 0x654321, 0.95) // 暗めの茶色、太さ4px、不透明度0.95
    this.boxTopGraphics.moveTo(boxLeft, boxTop)
    this.boxTopGraphics.lineTo(boxRight, boxTop)
    this.app.stage.addChild(this.boxTopGraphics)

    // 箱の底面（地面）を描画
    this.groundGraphics = new this.PIXI.Graphics()
    this.groundGraphics.beginFill(0x8b4513) // 茶色
    this.groundGraphics.lineStyle(4, 0x654321, 0.95) // 箱の境界線として明確に（太さ4px、不透明度0.95）
    this.groundGraphics.drawRect(boxLeft, boxBottom - 10, boxRight - boxLeft, 20)
    this.groundGraphics.endFill()
    this.app.stage.addChild(this.groundGraphics)

    // 箱の側面（左右の壁）を描画
    walls.forEach((wall, index) => {
      const wallGraphics = new this.PIXI.Graphics()
      wallGraphics.beginFill(0x654321) // 暗めの茶色
      wallGraphics.lineStyle(4, 0x543210, 0.95) // 箱の境界線（太さ4px、不透明度0.95）
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
}

