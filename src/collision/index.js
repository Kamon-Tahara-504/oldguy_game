import { CollisionDetector } from './collisionDetector.js'
import { BallMerger } from './ballMerger.js'
import { PositionResolver } from './positionResolver.js'

export class CollisionHandler {
  constructor(game, Matter) {
    this.game = game
    this.Matter = Matter
    
    // 各モジュールを初期化
    this.resolver = new PositionResolver(game, Matter)
    this.merger = new BallMerger(game, Matter, this.resolver)
    this.detector = new CollisionDetector(game, Matter)
    
    // 衝突検出時に合体処理を呼び出すコールバックを設定
    this.detector.onBallCollision = (ball1, ball2) => {
      this.merger.mergeBalls(ball1, ball2)
    }
  }
  
  handleCollision(event) {
    this.detector.handleCollision(event)
  }
  
  isBallGrounded(ball) {
    return this.detector.isBallGrounded(ball)
  }
  
  mergeBalls(ball1, ball2) {
    this.merger.mergeBalls(ball1, ball2)
  }
}

