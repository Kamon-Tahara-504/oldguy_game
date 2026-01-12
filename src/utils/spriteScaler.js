// スプライトのスケール計算を分離するユーティリティ

export class SpriteScaler {
  /**
   * スプライトのスケールを計算する
   * @param {PIXI.Texture} texture - PixiJSのテクスチャオブジェクト
   * @param {number} targetSize - 目標サイズ（直径）
   * @param {number} imageScale - 画像のスケール係数（デフォルト: 1.0）
   * @returns {number} 計算されたスケール値
   */
  static calculateScale(texture, targetSize, imageScale = 1.0) {
    // baseTextureのサイズを使用（読み込み前でも利用可能）
    const textureWidth = texture.baseTexture.width || texture.baseTexture.realWidth || 100
    const textureHeight = texture.baseTexture.height || texture.baseTexture.realHeight || 100
    
    if (textureWidth > 0 && textureHeight > 0) {
      const baseScale = targetSize / Math.max(textureWidth, textureHeight)
      return baseScale * imageScale
    }
    
    return 1.0 // デフォルトスケール
  }

  /**
   * スプライトにスケールを適用する
   * @param {PIXI.Sprite} sprite - PixiJSのスプライトオブジェクト
   * @param {PIXI.Texture} texture - PixiJSのテクスチャオブジェクト
   * @param {number} targetSize - 目標サイズ（直径）
   * @param {number} imageScale - 画像のスケール係数（デフォルト: 1.0）
   */
  static applyScale(sprite, texture, targetSize, imageScale = 1.0) {
    const scale = this.calculateScale(texture, targetSize, imageScale)
    sprite.scale.set(scale)
  }
}
