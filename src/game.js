import { createGround, createWalls, GAME_CONFIG, BALL_LEVELS, ASCEND_SCORE } from './physics.js'
import { Ball } from './ball.js'

export class Game {
  constructor(app, Matter, PIXI) {
    this.app = app
    this.PIXI = PIXI
    // Matter.jsは後で設定される（default exportの処理のため）
    this.balls = []
    this.currentBall = null
    this.nextBallLevel = 1
    this.isDragging = false
    this.ground = null
    this.walls = []
    this.groundGraphics = null
    this.wallGraphics = []
    this.score = 0
    this.scoreText = null
    this.previewBall = null
    this.previewGraphics = null
    this.boxTopGraphics = null
    this.isGameOver = false
    // 動的サイズを取得（後で更新されるが、初期値として設定）
    this.gameWidth = this.app.screen.width
    this.gameHeight = this.app.screen.height
    // マウス位置を追跡
    this.mouseX = this.gameWidth / 2  // 初期値は中央
    this.mouseY = 50
    // ボール放出のクールダウン（2秒 = 2000ミリ秒）
    this.lastBallDropTime = 0
    this.ballDropCooldown = 2000 // 2秒

    // Matter.jsエンジンを作成
    // Matter.jsはdefault exportなので、defaultプロパティから取得する必要がある場合がある
    const MatterLib = Matter.default || Matter
    if (!MatterLib || !MatterLib.Engine) {
      console.error('Matter.js is not loaded correctly. Matter:', Matter)
      return
    }
    this.Matter = MatterLib
    this.engine = MatterLib.Engine.create()
    this.engine.world.gravity.y = GAME_CONFIG.gravity
    // スリープ機能を有効化（停止したボールの物理計算を省略し、振動も抑制）
    this.engine.enableSleeping = true

    // 動的サイズの設定を作成（保存して後で使用）
    this.gameConfig = {
      ...GAME_CONFIG,
      width: this.gameWidth,
      height: this.gameHeight,
      groundY: this.gameHeight - 50, // 地面の位置を動的に調整
    }

    // 地面を作成
    this.ground = createGround(this.engine, this.gameConfig, this.Matter)

    // 壁を作成
    this.walls = createWalls(this.engine, this.gameConfig, this.Matter)

    // 箱の底面（地面）を描画
    this.groundGraphics = new this.PIXI.Graphics()
    this.groundGraphics.beginFill(0x8b4513) // 茶色
    this.groundGraphics.lineStyle(4, 0x654321, 0.95) // 箱の境界線として明確に（太さ4px、不透明度0.95）
    this.groundGraphics.drawRect(0, this.gameConfig.groundY - 10, this.gameConfig.width, 20)
    this.groundGraphics.endFill()
    this.app.stage.addChild(this.groundGraphics)

    // 箱の側面（左右の壁）を描画
    this.walls.forEach((wall, index) => {
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

    // 箱の上端ラインを描画（明確な箱の境界線）
    this.boxTopGraphics = new this.PIXI.Graphics()
    this.boxTopGraphics.lineStyle(4, 0x654321, 0.95) // 暗めの茶色、太さ4px、不透明度0.95
    this.boxTopGraphics.moveTo(0, this.gameConfig.boxTopY)
    this.boxTopGraphics.lineTo(this.gameConfig.width, this.gameConfig.boxTopY)
    this.app.stage.addChild(this.boxTopGraphics)

    // スコア表示
    this.scoreText = new this.PIXI.Text(`Score: ${this.score}`, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 2,
    })
    this.scoreText.x = 10
    this.scoreText.y = 10
    this.app.stage.addChild(this.scoreText)

    // 次のボールプレビュー
    this.updatePreview()

    // 衝突イベントを設定
    this.Matter.Events.on(this.engine, 'collisionStart', (event) => {
      this.handleCollision(event)
    })

    // マウスイベント
    this.app.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.app.canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
    this.app.canvas.addEventListener('mousemove', this.onMouseMove.bind(this))

    // ゲームループ
    this.app.ticker.add(() => {
      if (!this.isGameOver) {
        this.Matter.Engine.update(this.engine)
        this.update()
        this.checkGameOver()
      }
    })

    // 最初のボールを生成（初期マウス位置で）
    this.createNextBall()
    
    // マウス移動を検出してボール位置を更新（canvas外でも追跡）
    this.app.canvas.addEventListener('mouseenter', (e) => {
      const rect = this.app.canvas.getBoundingClientRect()
      this.mouseX = e.clientX - rect.left
      this.mouseY = e.clientY - rect.top
    })
  }

  updatePreview() {
    // プレビューを削除
    if (this.previewGraphics) {
      this.app.stage.removeChild(this.previewGraphics)
      this.previewGraphics.destroy()
    }

    // 新しいプレビューを作成
    const previewX = this.gameConfig.width - 80
    const previewY = 50
    const levelData = BALL_LEVELS[this.nextBallLevel]
    const previewRadius = levelData.radius * 0.6

    this.previewGraphics = new this.PIXI.Graphics()
    this.previewGraphics.beginFill(levelData.color)
    this.previewGraphics.lineStyle(2, 0x000000)
    this.previewGraphics.drawCircle(0, 0, previewRadius)
    this.previewGraphics.endFill()
    this.previewGraphics.x = previewX
    this.previewGraphics.y = previewY
    this.app.stage.addChild(this.previewGraphics)
  }

  createNextBall() {
    if (this.currentBall) return // 既にボールが存在する場合は生成しない
    if (this.isGameOver) return // ゲームオーバー中は生成しない

    // 現在のマウス位置を使用（最新の位置を反映）
    const levelData = BALL_LEVELS[this.nextBallLevel]
    const ballRadius = levelData.radius
    // マウス位置が有効な範囲内にあることを確認
    const clampedMouseX = Math.max(
      ballRadius,
      Math.min(
        this.gameConfig.width - ballRadius,
        this.mouseX || this.gameConfig.width / 2
      )
    )
    const startX = clampedMouseX
    const startY = 50

    this.currentBall = new Ball(
      this.engine,
      this.app.stage,
      startX,
      startY,
      this.nextBallLevel,
      this.Matter,
      this.PIXI
    )

    // 落下していない状態を確実に設定
    this.currentBall.isFalling = false
    this.currentBall.fallComplete = false // 落下完了フラグをリセット
    
    // 静的ボディとして設定（物理エンジンの影響を受けない）
    this.Matter.Body.setStatic(this.currentBall.body, true)
    
    // Graphicsの位置を設定（Bodyは後で同期される）
    this.currentBall.graphics.x = startX
    this.currentBall.graphics.y = startY

    // 次のレベルをランダムに決定（1-3レベル）
    this.nextBallLevel = Math.floor(Math.random() * 3) + 1
    this.updatePreview()
  }

  onMouseDown(e) {
    // マウス位置を更新
    const rect = this.app.canvas.getBoundingClientRect()
    this.mouseX = e.clientX - rect.left
    this.mouseY = e.clientY - rect.top
    
    // ボールが存在し、まだ落下していない場合、位置を更新
    if (this.currentBall && !this.currentBall.isFalling && !this.isGameOver) {
      const xClamped = Math.max(
        this.currentBall.radius,
        Math.min(this.gameConfig.width - this.currentBall.radius, this.mouseX)
      )
      const fixedY = 50
      this.currentBall.graphics.x = xClamped
      this.currentBall.graphics.y = fixedY
    }
    // ボールの落下はonMouseUpで行う
  }

  onMouseUp(e) {
    // マウス位置を更新（念のため）
    const rect = this.app.canvas.getBoundingClientRect()
    this.mouseX = e.clientX - rect.left
    this.mouseY = e.clientY - rect.top
    
    // マウスアップでも落下開始（クールダウンチェック付き）
    if (this.currentBall && !this.currentBall.isFalling && !this.isGameOver) {
      this.startBallFall()
    }
  }

  startBallFall() {
    if (!this.currentBall || this.currentBall.isFalling || this.isGameOver) return

    // クールダウンチェック（2秒に1回のみ）
    const currentTime = Date.now()
    if (currentTime - this.lastBallDropTime < this.ballDropCooldown) {
      return // クールダウン中は何もしない
    }

    // 最新のマウス位置でGraphicsを更新（念のため）
    const xClamped = Math.max(
      this.currentBall.radius,
      Math.min(this.gameConfig.width - this.currentBall.radius, this.mouseX)
    )
    const fixedY = 50
    this.currentBall.graphics.x = xClamped
    this.currentBall.graphics.y = fixedY

    // Graphicsの現在位置を取得
    const currentX = this.currentBall.graphics.x
    const currentY = this.currentBall.graphics.y

    // まず静的ボディから動的ボディに変更（変換時に位置がリセットされる可能性があるため）
    this.Matter.Body.setStatic(this.currentBall.body, false)
    
    // 変換後、位置を確実に設定（複数回設定して確実にする）
    this.Matter.Body.setPosition(this.currentBall.body, { x: currentX, y: currentY })
    
    // Bodyの速度と角速度を0にリセット
    this.Matter.Body.setVelocity(this.currentBall.body, { x: 0, y: 0 })
    this.Matter.Body.setAngularVelocity(this.currentBall.body, 0)
    
    // 重力を有効化
    this.Matter.Body.set(this.currentBall.body, { gravityScale: 1 })
    
    // Bodyの位置を再度設定（確実にするため）
    this.Matter.Body.setPosition(this.currentBall.body, { x: currentX, y: currentY })
    
    // Bodyをスリープ状態から解除（スリープしていると動かない）
    this.Matter.Body.set(this.currentBall.body, { sleepThreshold: Infinity })
    this.Matter.Sleeping.set(this.currentBall.body, false)
    
    // 落下開始
    this.currentBall.startFall()

    // ボールリストに追加
    this.balls.push(this.currentBall)

    // クールダウンタイマーを更新
    this.lastBallDropTime = currentTime

    // 現在のボールをクリア
    this.currentBall = null

    // クールダウン後に次のボールを生成
    setTimeout(() => {
      this.createNextBall()
    }, this.ballDropCooldown)
  }

  onMouseMove(e) {
    // マウス位置を常に追跡（最新の位置を確実に保存）
    const rect = this.app.canvas.getBoundingClientRect()
    this.mouseX = e.clientX - rect.left
    this.mouseY = e.clientY - rect.top
    
    // ボールが落下していない場合は常にマウスに追従（Graphicsのみ制御）
    if (this.currentBall && !this.currentBall.isFalling && !this.isGameOver) {
      const xClamped = Math.max(
        this.currentBall.radius,
        Math.min(this.gameConfig.width - this.currentBall.radius, this.mouseX)
      )

      // Y座標は固定（初期位置を維持）
      const fixedY = 50

      // Graphicsの位置を直接変更（Bodyはupdate()で同期される）
      this.currentBall.graphics.x = xClamped
      this.currentBall.graphics.y = fixedY
    }
  }

  handleCollision(event) {
    if (this.isGameOver) return

    const pairs = event.pairs

    for (const pair of pairs) {
      const { bodyA, bodyB } = pair

      // 地面や壁との衝突は無視
      if (bodyA === this.ground || bodyB === this.ground) {
        continue
      }
      if (this.walls.includes(bodyA) || this.walls.includes(bodyB)) {
        continue
      }

      // ボール同士の衝突を処理
      const ballA = this.balls.find(b => b.body === bodyA)
      const ballB = this.balls.find(b => b.body === bodyB)

      if (ballA && ballB && !ballA.isMerging && !ballB.isMerging) {
        // 同じレベルなら合体
        if (ballA.level === ballB.level) {
          this.mergeBalls(ballA, ballB)
        }
      }
    }
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

    // 合体位置を計算
    const mergeX = (ball1.body.position.x + ball2.body.position.x) / 2
    const mergeY = Math.max(ball1.body.position.y, ball2.body.position.y)

    // 合体先のレベルを計算
    const newLevel = ball1.level + 1
    if (newLevel > 6) {
      ball1.isMerging = false
      ball2.isMerging = false
      return
    }

    // スコア加算
    const scoreToAdd = BALL_LEVELS[newLevel].score
    this.addScore(scoreToAdd)

    // 元のボールを破棄
    this.removeBall(ball1)
    this.removeBall(ball2)

    // 新しいレベルのボールを生成
    const newBall = new Ball(
      this.engine,
      this.app.stage,
      mergeX,
      mergeY,
      newLevel,
      this.Matter,
      this.PIXI
    )
    newBall.isFalling = true // 落下中フラグを設定
    this.balls.push(newBall)
  }

  ascendEffect(ball1, ball2) {
    // スコア加算
    this.addScore(ASCEND_SCORE)

    // 昇天アニメーション（簡易版：PixiJSのtickerを使用）
    const ascendSpeed = 5
    const ascendDuration = 60 // フレーム数
    let frame = 0

    const animateAscend = () => {
      frame++
      if (frame < ascendDuration) {
        if (ball1.body && ball2.body) {
          this.Matter.Body.setPosition(ball1.body, {
            x: ball1.body.position.x,
            y: ball1.body.position.y - ascendSpeed
          })
          this.Matter.Body.setPosition(ball2.body, {
            x: ball2.body.position.x,
            y: ball2.body.position.y - ascendSpeed
          })
        }
      } else {
        // アニメーション完了後、ボールを破棄
        this.removeBall(ball1)
        this.removeBall(ball2)
        // アニメーション終了時にtickerから削除
        this.app.ticker.remove(animateAscend)
      }
    }

    // アニメーションをtickerに追加
    this.app.ticker.add(animateAscend)
  }

  removeBall(ball) {
    const index = this.balls.indexOf(ball)
    if (index > -1) {
      this.balls.splice(index, 1)
    }
    ball.destroy()
  }

  addScore(points) {
    this.score += points
    this.scoreText.text = `Score: ${this.score}`
  }

  checkGameOver() {
    // 箱から溢れたボールがあるかチェック
    // ボールの上部（body.position.y - ball.radius）が箱の上端を超えたらゲームオーバー
    // currentBallは判定対象外（落下前のボールは箱の外にあるため除外）
    for (const ball of this.balls) {
      // 落下中でないボールも除外（合体処理中など）
      if (ball.isFalling) {
        const ballTop = ball.body.position.y - ball.radius
        // ボールの上部が箱の上端を超えたらゲームオーバー
        if (ballTop < this.gameConfig.boxTopY) {
          this.gameOver()
          return
        }
      }
    }
  }

  gameOver() {
    this.isGameOver = true
    
    // ゲームオーバーメッセージ
    const gameOverText = new this.PIXI.Text('GAME OVER', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xff0000,
      stroke: 0x000000,
      strokeThickness: 4,
    })
    gameOverText.x = this.gameConfig.width / 2 - gameOverText.width / 2
    gameOverText.y = this.gameConfig.height / 2 - gameOverText.height / 2
    this.app.stage.addChild(gameOverText)
  }

  update() {
    // すべてのボールの位置を同期
    this.balls.forEach(ball => {
      ball.update()
    })

    // 現在のボールの位置を同期
    if (this.currentBall) {
      // 落下前のボールはGraphicsの位置でBodyを制御（Ball.update()で処理）
      this.currentBall.update()
    }
    
    // 落下中のボールのfallCompleteフラグを更新（合体後のボール用）
    // 注: 次のボールの生成はstartBallFall()で即座に行うため、ここでの判定は簡略化
    for (const ball of this.balls) {
      if (ball.isFalling && !ball.fallComplete) {
        const body = ball.body
        const velocity = Math.abs(body.velocity.x) + Math.abs(body.velocity.y)
        const isGrounded = body.position.y >= this.gameConfig.groundY - ball.radius - 10
        
        // 速度が非常に小さい場合（ほぼ停止）かつ地面に到達している場合、落下完了とみなす
        if (velocity < 0.5 && isGrounded) {
          ball.isFalling = false
          ball.fallComplete = true
        }
      }
    }
  }
}
