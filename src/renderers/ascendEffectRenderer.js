// 昇天エフェクトの描画と管理

export class AscendEffectRenderer {
  constructor(game, app, PIXI) {
    this.game = game
    this.app = app
    this.PIXI = PIXI
    this.activeEffects = []
    this.effectContainer = null
  }

  // エフェクトコンテナを初期化
  init() {
    // 既存のコンテナをクリア
    if (this.effectContainer) {
      if (this.effectContainer.parent) {
        this.app.stage.removeChild(this.effectContainer)
      }
      this.effectContainer.destroy({ children: true })
    }

    // エフェクト用のコンテナを作成
    this.effectContainer = new this.PIXI.Container()
    this.activeEffects = []

    // エフェクトコンテナを最前面に配置（ボールより前面）
    this.app.stage.addChild(this.effectContainer)
  }

  // 魂の形状を作成
  createSoul(x, y) {
    const container = new this.PIXI.Container()
    
    // 魂の形状を複数の円形（光の粒子）で作成
    const particleCount = 8 + Math.floor(Math.random() * 4) // 8-11個の粒子
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new this.PIXI.Graphics()
      
      // 粒子のサイズ（ランダム）
      const size = 8 + Math.random() * 12 // 8-20px
      
      // 粒子の位置（中心から外側に向かって配置）
      const angle = (i / particleCount) * Math.PI * 2
      const distance = 15 + Math.random() * 25 // 中心からの距離
      const offsetX = Math.cos(angle) * distance
      const offsetY = Math.sin(angle) * distance
      
      // 粒子の色（白色から淡い黄色まで）
      const color = 0xffffff
      const alpha = 0.7 + Math.random() * 0.3 // 0.7-1.0
      
      // 粒子を描画
      particle.beginFill(color, alpha)
      particle.drawCircle(offsetX, offsetY, size)
      particle.endFill()
      
      // 光の効果（外側に薄い円を追加）
      particle.beginFill(color, alpha * 0.3)
      particle.drawCircle(offsetX, offsetY, size * 1.5)
      particle.endFill()
      
      container.addChild(particle)
    }
    
    // 中心に大きな光の粒子
    const centerParticle = new this.PIXI.Graphics()
    centerParticle.beginFill(0xffffaa, 0.8) // 淡い黄色
    centerParticle.drawCircle(0, 0, 15)
    centerParticle.endFill()
    container.addChildAt(centerParticle, 0) // 背景に配置
    
    // 天使の輪を作成（黄色の輪）
    const halo = new this.PIXI.Graphics()
    halo.lineStyle(4, 0xffd700, 0.9) // 金色、太さ4px
    // 上部に輪を描画（楕円形）
    halo.drawEllipse(0, -30, 40, 15) // x, y, width, height
    halo.endFill()
    container.addChild(halo)
    
    // 位置を設定
    container.x = x
    container.y = y
    
    return container
  }

  // 昇天アニメーションを開始
  startAscend(x, y) {
    // 魂の形状を作成
    const soul = this.createSoul(x, y)
    
    // エフェクト情報を保存
    const effect = {
      graphics: soul,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      startTime: Date.now(),
      duration: 6000, // 6秒（さらに遅くする）
      speed: 0.5, // 初期速度（さらに遅くする）
      acceleration: 0.01, // 加速度（さらに小さくする）
      swayAmplitude: 15, // 揺れの振幅
      swaySpeed: 0.03, // 揺れの速度（さらに遅くする）
      swayPhase: Math.random() * Math.PI * 2 // 揺れの初期位相（ランダム）
    }
    
    // コンテナに追加
    this.effectContainer.addChild(soul)
    this.activeEffects.push(effect)
  }

  // エフェクトを更新
  update() {
    if (!this.effectContainer || this.activeEffects.length === 0) return

    const currentTime = Date.now()
    const boxTop = this.game.gameConfig.boxTop || 0

    // 各エフェクトを更新
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i]
      const elapsed = currentTime - effect.startTime
      const progress = elapsed / effect.duration

      if (progress >= 1.0) {
        // アニメーション完了：削除
        if (effect.graphics.parent) {
          this.effectContainer.removeChild(effect.graphics)
        }
        effect.graphics.destroy({ children: true })
        this.activeEffects.splice(i, 1)
        continue
      }

      // 位置を更新（上に向かって移動、徐々に加速）
      effect.speed += effect.acceleration
      effect.currentY -= effect.speed
      
      // 左右にゆらゆら揺らす（サイン波を使用）
      const swayOffset = Math.sin(effect.swayPhase + elapsed * effect.swaySpeed) * effect.swayAmplitude
      effect.currentX = effect.startX + swayOffset
      
      effect.graphics.x = effect.currentX
      effect.graphics.y = effect.currentY

      // 透明度を更新（フェードアウト）
      const alpha = 1.0 - progress
      effect.graphics.alpha = alpha

      // スケールを更新（徐々に小さくなる）
      const scale = 1.0 - progress * 0.3 // 最大30%まで縮小
      effect.graphics.scale.set(scale)

      // 画面外に出たら削除（念のため）
      if (effect.currentY < boxTop - 200) {
        if (effect.graphics.parent) {
          this.effectContainer.removeChild(effect.graphics)
        }
        effect.graphics.destroy({ children: true })
        this.activeEffects.splice(i, 1)
      }
    }
  }
}
