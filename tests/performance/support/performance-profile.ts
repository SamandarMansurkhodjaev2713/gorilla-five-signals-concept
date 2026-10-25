// Full Reactor's implicit orbit/shard appends finish at 2256ms. The previous
// 960ms observation tail ended before that choreography; include its completion.
export const MOTION_PERFORMANCE_SETTLE_MS = 2_500;

/** Release limits are shared by the journey and its regression contract. */
export const MOTION_PERFORMANCE_PROFILE = Object.freeze({
  cpuThrottleRate: 4,
  sessions: 3,
  frameWorkMs: 16,
  longTaskMs: 50,
  interactionMs: 200,
});
