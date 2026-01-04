import Phaser from 'phaser'

// 顔面のレベル定義
export enum FaceLevel {
  Baby = 1,    // 赤ちゃんの顔 - 2点
  Child = 2,   // 少年の顔 - 6点
  Youth = 3,   // 青年の顔 - 10点
  Adult = 4,   // 大人の顔 - 14点
  Middle = 5,  // 中年の顔 - 18点
  Elder = 6    // 高齢の顔 - 20点
}

// 顔面オブジェクトクラス
export class Face extends Phaser.Physics.Arcade.Sprite {
  public level: FaceLevel
  public radius: number
  public isFalling: boolean = false

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    level: FaceLevel,
    radius: number = 30
  ) {
    // テクスチャを動的に生成（暫定的に円形のグラフィックを作成）
    const graphics = scene.add.graphics()
    const color = Face.getColorByLevel(level)
    graphics.fillStyle(color)
    graphics.fillCircle(radius, radius, radius)
    graphics.lineStyle(2, 0x000000)
    graphics.strokeCircle(radius, radius, radius)
    graphics.generateTexture(`face_${level}`, radius * 2, radius * 2)
    graphics.destroy()

    super(scene, x, y, `face_${level}`)
    this.level = level
    this.radius = radius
    
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCircle(radius)
    body.setCollideWorldBounds(true)
    body.setBounce(0.2) // バウンス係数
  }

  // レベルに応じた色を返す（暫定的）
  static getColorByLevel(level: FaceLevel): number {
    const colors = [
      0xff6b9d, // 赤ちゃん - ピンク
      0xffa500, // 少年 - オレンジ
      0xffff00, // 青年 - イエロー
      0x00ff00, // 大人 - グリーン
      0x0099ff, // 中年 - ブルー
      0x9966ff  // 高齢 - パープル
    ]
    return colors[level - 1] || 0xffffff
  }

  // 落下を開始
  startFall() {
    this.isFalling = true
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setGravityY(400) // 重力を設定
  }
}

// ゲームシーン
export default class GameScene extends Phaser.Scene {
  private currentFace: Face | null = null
  private isDragging: boolean = false
  private groundY: number = 550 // 地面のY座標
  private nextFaceLevel: FaceLevel = FaceLevel.Baby

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    // 背景色を設定
    this.cameras.main.setBackgroundColor('#87CEEB')

    // 地面を描画（暫定的に線で表示）
    const graphics = this.add.graphics()
    graphics.lineStyle(4, 0x8B4513)
    graphics.lineBetween(0, this.groundY, this.cameras.main.width, this.groundY)
    
    // 物理システムを有効化
    this.physics.world.setBounds(0, 0, this.cameras.main.width, this.groundY)
    
    // マウス入力を設定
    this.input.on('pointerdown', this.onPointerDown, this)
    this.input.on('pointerup', this.onPointerUp, this)
    this.input.on('pointermove', this.onPointerMove, this)

    // 最初の顔面を生成
    this.createNextFace()
  }

  update() {
    // マウス追従中の処理
    if (this.currentFace && !this.currentFace.isFalling && this.isDragging) {
      const pointer = this.input.activePointer
      this.currentFace.x = Phaser.Math.Clamp(
        pointer.x,
        this.currentFace.radius,
        this.cameras.main.width - this.currentFace.radius
      )
      const body = this.currentFace.body as Phaser.Physics.Arcade.Body
      body.setVelocity(0, 0)
    }

    // 落下中の処理
    if (this.currentFace && this.currentFace.isFalling) {
      const body = this.currentFace.body as Phaser.Physics.Arcade.Body
      
      // 地面に到達したら停止
      if (this.currentFace.y + this.currentFace.radius >= this.groundY) {
        body.setVelocity(0, 0)
        body.setGravityY(0)
        this.currentFace.y = this.groundY - this.currentFace.radius
        this.currentFace.isFalling = false
      }
    }
  }

  // 次の顔面を生成（画面上部で待機）
  private createNextFace() {
    const startX = this.cameras.main.width / 2
    const startY = 50 // 画面上部
    
    this.currentFace = new Face(
      this,
      startX,
      startY,
      this.nextFaceLevel,
      30
    )
    
    // 落下させない
    const body = this.currentFace.body as Phaser.Physics.Arcade.Body
    body.setGravityY(0)
    body.setVelocity(0, 0)
    
    // 次のレベルをランダムに決定（暫定的）
    this.nextFaceLevel = Phaser.Math.Between(1, 3) as FaceLevel
  }

  // マウスダウン
  private onPointerDown(_pointer: Phaser.Input.Pointer) {
    if (this.currentFace && !this.currentFace.isFalling) {
      this.isDragging = true
    }
  }

  // マウスアップ - 落下開始
  private onPointerUp(_pointer: Phaser.Input.Pointer) {
    if (this.currentFace && !this.currentFace.isFalling && this.isDragging) {
      this.isDragging = false
      this.currentFace.startFall()
      
      // 現在の顔面を保存して、次の顔面を生成
      // TODO: 落下完了後の処理を実装（合体判定に使用）
      this.createNextFace()
    }
  }

  // マウス移動 - 位置を追従
  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (this.currentFace && !this.currentFace.isFalling && this.isDragging) {
      this.currentFace.x = Phaser.Math.Clamp(
        pointer.x,
        this.currentFace.radius,
        this.cameras.main.width - this.currentFace.radius
      )
    }
  }
}

