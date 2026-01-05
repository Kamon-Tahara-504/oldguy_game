// localStorage操作を集約

const HIGHSCORE_KEY = 'oldguy_game_highscore'

/**
 * ハイスコアを読み込む
 * @returns {number} ハイスコア
 */
export function loadHighScore() {
  return parseInt(localStorage.getItem(HIGHSCORE_KEY) || '0', 10)
}

/**
 * ハイスコアを保存する
 * @param {number} score スコア
 */
export function saveHighScore(score) {
  localStorage.setItem(HIGHSCORE_KEY, score.toString())
}

