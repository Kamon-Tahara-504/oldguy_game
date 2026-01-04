import Phaser from 'phaser'
import GameScene from './scenes/GameScene'

// Phaserゲームの設定
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'app',
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false, // デバッグモード（開発中はtrueにすると便利）
    },
  },
  scene: GameScene,
}

// ゲームを開始
new Phaser.Game(config)

