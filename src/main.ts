import Phaser from 'phaser'

// ゲームシーンの最小構成
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    // 背景色を設定
    this.cameras.main.setBackgroundColor('#2c3e50')

    // テキストを表示してPhaserが動作していることを確認
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Phaser 3 が起動しました！\nおっさんゲーム開発準備完了',
      {
        fontSize: '32px',
        color: '#ffffff',
        align: 'center',
      }
    ).setOrigin(0.5)
  }
}

// Phaserゲームの設定
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'app',
  backgroundColor: '#2c3e50',
  scene: GameScene,
}

// ゲームを開始
new Phaser.Game(config)

