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
    this.dangerLineGraphics = null
    this.isGameOver = false

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

    // 地面を作成
    this.ground = createGround(this.engine, GAME_CONFIG, this.Matter)

    // 壁を作成
    this.walls = createWalls(this.engine, GAME_CONFIG, this.Matter)

    // 地面を描画
    this.groundGraphics = new this.PIXI.Graphics()
    this.groundGraphics.beginFill(0x8b4513)
    this.groundGraphics.drawRect(0, GAME_CONFIG.groundY - 10, GAME_CONFIG.width, 20)
    this.groundGraphics.endFill()
    this.app.stage.addChild(this.groundGraphics)

    // 壁を描画
    this.walls.forEach((wall, index) => {
      const wallGraphics = new this.PIXI.Graphics()
      wallGraphics.beginFill(0x654321)
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

    // 危険ラインを描画
    this.dangerLineGraphics = new this.PIXI.Graphics()
    this.dangerLineGraphics.lineStyle(3, 0xff0000, 0.8)
    this.dangerLineGraphics.moveTo(0, GAME_CONFIG.dangerLineY)
    this.dangerLineGraphics.lineTo(GAME_CONFIG.width, GAME_CONFIG.dangerLineY)
    this.app.stage.addChild(this.dangerLineGraphics)

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

    // 最初のボールを生成
    this.createNextBall()
  }

  updatePreview() {
    // プレビューを削除
    if (this.previewGraphics) {
      this.app.stage.removeChild(this.previewGraphics)
      this.previewGraphics.destroy()
    }

    // 新しいプレビューを作成
    const previewX = GAME_CONFIG.width - 80
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

    const startX = GAME_CONFIG.width / 2
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

    // 重力を無効化（落下させない）
    this.Matter.Body.setStatic(this.currentBall.body, false)
    this.Matter.Body.set(this.currentBall.body, { gravityScale: 0 })

    // 次のレベルをランダムに決定（1-3レベル）
    this.nextBallLevel = Math.floor(Math.random() * 3) + 1
    this.updatePreview()
  }

  onMouseDown(e) {
    // クリックで落下開始（ボールが落下していない場合のみ）
    if (this.currentBall && !this.currentBall.isFalling && !this.isGameOver) {
      // 重力を有効化
      this.Matter.Body.set(this.currentBall.body, { gravityScale: 1 })
      this.currentBall.startFall()

      // ボールリストに追加
      this.balls.push(this.currentBall)

      // 次のボールを生成（落下完了後に）
      this.currentBall = null
    }
  }

  onMouseUp(e) {
    // マウスアップでも落下開始
    if (this.currentBall && !this.currentBall.isFalling && !this.isGameOver) {
      // 重力を有効化
      this.Matter.Body.set(this.currentBall.body, { gravityScale: 1 })
      this.currentBall.startFall()

      // ボールリストに追加
      this.balls.push(this.currentBall)

      // 次のボールを生成（落下完了後に）
      this.currentBall = null
    }
  }

  onMouseMove(e) {
    // ボールが落下していない場合は常にマウスに追従
    if (this.currentBall && !this.currentBall.isFalling && !this.isGameOver) {
      const rect = this.app.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const xClamped = Math.max(
        this.currentBall.radius,
        Math.min(GAME_CONFIG.width - this.currentBall.radius, x)
      )

      this.Matter.Body.setPosition(this.currentBall.body, {
        x: xClamped,
        y: this.currentBall.body.position.y
      })
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
    // 危険ラインを超えたボールがあるかチェック
    for (const ball of this.balls) {
      if (ball.body.position.y < GAME_CONFIG.dangerLineY) {
        this.gameOver()
        return
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
    gameOverText.x = GAME_CONFIG.width / 2 - gameOverText.width / 2
    gameOverText.y = GAME_CONFIG.height / 2 - gameOverText.height / 2
    this.app.stage.addChild(gameOverText)
  }

  update() {
    // すべてのボールの位置を同期
    this.balls.forEach(ball => {
      ball.update()
    })

    // 現在のボールの位置を同期
    if (this.currentBall) {
      this.currentBall.update()
      
      // 落下中のボールが地面に到達し、停止したかをチェック
      if (this.currentBall.isFalling) {
        const body = this.currentBall.body
        const velocity = Math.abs(body.velocity.x) + Math.abs(body.velocity.y)
        
        // 速度が非常に小さい場合（ほぼ停止）、落下完了とみなす
        if (velocity < 1 && body.position.y >= GAME_CONFIG.groundY - this.currentBall.radius - 5) {
          this.currentBall.isFalling = false
          // 落下完了後に次のボールを生成（一度だけ実行されるように）
          if (!this.currentBall.fallComplete) {
            this.currentBall.fallComplete = true
            setTimeout(() => {
              this.currentBall = null
              this.createNextBall()
            }, 100)
          }
        }
      }
    }
  }
}
