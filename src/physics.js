// 物理エンジン関連のユーティリティ
export const GAME_CONFIG = {
  width: 800,
  height: 600,
  groundY: 550,
  ballRadius: 30,
  gravity: 0.4, // より軽い、ふわっとした動き
  boxTopY: 0, // 箱の上端（ボールがこれを超えたらゲームオーバー）
}

// ボールレベルの定義
export const BALL_LEVELS = {
  1: { name: 'Baby', score: 2, color: 0xff6b9d, radius: 25 },
  2: { name: 'Child', score: 6, color: 0xffa500, radius: 30 },
  3: { name: 'Youth', score: 10, color: 0xffff00, radius: 35 },
  4: { name: 'Adult', score: 14, color: 0x00ff00, radius: 40 },
  5: { name: 'Middle', score: 18, color: 0x0099ff, radius: 45 },
  6: { name: 'Elder', score: 20, color: 0x9966ff, radius: 50 },
}

// 昇天時の得点
export const ASCEND_SCORE = 22

// 地面を作成
export function createGround(engine, config, Matter) {
  const ground = Matter.Bodies.rectangle(
    config.width / 2,
    config.groundY,
    config.width,
    20,
    { isStatic: true }
  )
  Matter.World.add(engine.world, ground)
  return ground
}

// 壁を作成（左右）
export function createWalls(engine, config, Matter) {
  const wallThickness = 20
  const walls = []

  // 左の壁
  const leftWall = Matter.Bodies.rectangle(
    -wallThickness / 2,
    config.height / 2,
    wallThickness,
    config.height,
    { isStatic: true }
  )

  // 右の壁
  const rightWall = Matter.Bodies.rectangle(
    config.width + wallThickness / 2,
    config.height / 2,
    wallThickness,
    config.height,
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

