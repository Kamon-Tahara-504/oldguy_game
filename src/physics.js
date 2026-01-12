// 物理エンジン関連のユーティリティ
export const GAME_CONFIG = {
  width: 800,
  height: 600,
  groundY: 550,
  ballRadius: 30,
  gravity: 0.4, // より軽い、ふわっとした動き
  boxTopY: 0, // 箱の上端（ボールがこれを超えたらゲームオーバー）
  // 箱の範囲を定義（画面内に配置）
  boxMarginLeft: 175,    // 左側のマージン（正方形に近づけるため）
  boxMarginRight: 175,   // 右側のマージン（正方形に近づけるため）
  boxMarginTop: 100,    // 上部のマージン（UI用）
  // 箱の範囲は動的に計算される（game.jsで設定）
  // 固定箱サイズ（画面サイズに関わらず同じサイズ）
  BOX_WIDTH: 1200,  // 箱の幅（固定）
  BOX_HEIGHT: 800, // 箱の高さ（固定）
  // 壁の設定
  WALL_THICKNESS: 20, // 壁の厚さ
}

// ボールレベルの定義
const BASE_RADIUS = 40 // レベル1の基準サイズ
const SIZE_MULTIPLIER = 1.4 // レベルごとの倍率（合体時に1.4倍になる）

export const BALL_LEVELS = {
  1: { name: 'Baby', score: 2, color: 0xff6b9d, radius: BASE_RADIUS, imagePath: './assets/boy1.png', imageOffsetX: 0, imageOffsetY: 0, imageScale: 1.0 },
  2: { name: 'Child', score: 6, color: 0xffa500, radius: BASE_RADIUS * SIZE_MULTIPLIER, imagePath: './assets/boy2.png', imageOffsetX: 0, imageOffsetY: 0, imageScale: 1.0 },
  3: { name: 'Youth', score: 10, color: 0xffff00, radius: BASE_RADIUS * SIZE_MULTIPLIER ** 2, imagePath: './assets/boy3.png', imageOffsetX: 0, imageOffsetY: 0, imageScale: 1.0 },
  4: { name: 'Adult', score: 14, color: 0x00ff00, radius: BASE_RADIUS * SIZE_MULTIPLIER ** 3, imagePath: './assets/boy4.png', imageOffsetX: 0, imageOffsetY: 0, imageScale: 1.0 },
  5: { name: 'Middle', score: 18, color: 0x0099ff, radius: BASE_RADIUS * SIZE_MULTIPLIER ** 4, imagePath: './assets/boy5.png', imageOffsetX: 0, imageOffsetY: 0, imageScale: 1.0 },
  6: { name: 'Elder', score: 20, color: 0x9966ff, radius: BASE_RADIUS * SIZE_MULTIPLIER ** 5, imagePath: './assets/boy6.png', imageOffsetX: 0, imageOffsetY: 0, imageScale: 1.0 },
}

// 昇天時の得点
export const ASCEND_SCORE = 22

// 地面を作成
export function createGround(engine, config, Matter) {
  // 箱の幅と中央位置を使用
  const boxLeft = config.boxLeft || 0
  const boxRight = config.boxRight || config.width
  const boxWidth = boxRight - boxLeft
  const boxCenterX = (boxLeft + boxRight) / 2
  
  const ground = Matter.Bodies.rectangle(
    boxCenterX,        // 箱の中央
    config.groundY,
    boxWidth,          // 箱の幅
    20,
    { isStatic: true }
  )
  Matter.World.add(engine.world, ground)
  return ground
}

// 壁を作成（左右）
export function createWalls(engine, config, Matter) {
  const wallThickness = GAME_CONFIG.WALL_THICKNESS
  const walls = []

  // 箱の範囲を取得
  const boxLeft = config.boxLeft || config.boxMarginLeft || 20
  const boxRight = config.boxRight || (config.width - (config.boxMarginRight || 20))
  const boxTop = config.boxTop || (config.boxMarginTop || 100)
  const boxBottom = config.boxBottom || config.groundY

  // 左の壁（画面内の箱の左端に配置）
  const leftWallX = boxLeft + wallThickness / 2
  const leftWall = Matter.Bodies.rectangle(
    leftWallX,
    (boxTop + boxBottom) / 2,
    wallThickness,
    boxBottom - boxTop,
    { isStatic: true }
  )

  // 右の壁（画面内の箱の右端に配置）
  const rightWallX = boxRight - wallThickness / 2
  const rightWall = Matter.Bodies.rectangle(
    rightWallX,
    (boxTop + boxBottom) / 2,
    wallThickness,
    boxBottom - boxTop,
    { isStatic: true }
  )

  walls.push(leftWall, rightWall)
  Matter.World.add(engine.world, walls)
  return walls
}

// 円（ボール）を作成
export function createBall(engine, x, y, radius, Matter) {
  const ball = Matter.Bodies.circle(x, y, radius, {
    restitution: 0.2,   // バウンス係数（振動を減らすため低めに）
    friction: 0.7,      // 摩擦係数（すべりを減らすため高めに）
    frictionAir: 0.05,  // 空気抵抗（振動を早く止めるため高めに）
    density: 0.001,     // 密度（軽く感じさせる）
  })
  Matter.World.add(engine.world, ball)
  return ball
}

