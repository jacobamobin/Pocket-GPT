/**
 * Shared type definitions (as JSDoc for plain JS).
 *
 * @typedef {'idle'|'running'|'paused'|'stopped'|'completed'|'error'} SessionStatus
 * @typedef {'watch_learn'|'attention_cinema'|'style_transfer'} FeatureType
 *
 * @typedef {Object} ModelConfig
 * @property {number} vocab_size
 * @property {number} n_embd
 * @property {number} n_layer
 * @property {number} n_head
 * @property {number} block_size
 * @property {number} dropout
 * @property {boolean} weight_tying
 *
 * @typedef {Object} TrainingConfig
 * @property {number} batch_size
 * @property {number} max_iters
 * @property {number} learning_rate
 * @property {number} eval_interval
 *
 * @typedef {Object} TrainingMetrics
 * @property {string} session_id
 * @property {number} step
 * @property {number} train_loss
 * @property {number} val_loss
 * @property {number} timestamp
 *
 * @typedef {Object} GeneratedSample
 * @property {string} session_id
 * @property {number} step
 * @property {string} text
 * @property {string} prompt
 * @property {number} timestamp
 *
 * @typedef {Object} AttentionSnapshot
 * @property {string} session_id
 * @property {number} step
 * @property {number} layer
 * @property {number} head
 * @property {number[][]} matrix
 * @property {string[]} tokens
 * @property {number} timestamp
 *
 * @typedef {Object} SessionInfo
 * @property {string} session_id
 * @property {FeatureType} feature_type
 * @property {SessionStatus} status
 * @property {number} current_iter
 * @property {number} max_iters
 * @property {ModelConfig} model_config
 * @property {TrainingConfig} training_config
 *
 * @typedef {Object} DatasetInfo
 * @property {string} name
 * @property {string} display_name
 * @property {number} char_count
 * @property {number} vocab_size
 * @property {number} word_count
 */

export const SESSION_STATUS = /** @type {const} */ ({
  IDLE:      'idle',
  RUNNING:   'running',
  PAUSED:    'paused',
  STOPPED:   'stopped',
  COMPLETED: 'completed',
  ERROR:     'error',
})

export const FEATURE_TYPE = /** @type {const} */ ({
  WATCH_LEARN:      'watch_learn',
  ATTENTION_CINEMA: 'attention_cinema',
  STYLE_TRANSFER:   'style_transfer',
})

