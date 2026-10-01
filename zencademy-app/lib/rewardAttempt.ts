export type RewardResult = { id: string; xp: number; coins: number; activity_id: string };
export type RewardTransport = {
  start: (id: string, activity: string) => Promise<void>;
  claimReward: (id: string, activity: string) => Promise<RewardResult>;
};

/** Retries reuse the id; concurrent calls share a promise, including the start request. */
export class RewardAttempt {
  private starting: Promise<void> | null = null;
  private claiming: Promise<RewardResult> | null = null;
  result: RewardResult | null = null;
  constructor(readonly id: string, readonly activity: string, private transport: RewardTransport) {}
  get saving() { return this.claiming !== null; }
  start(): Promise<void> {
    if (!this.starting) {
      this.starting = this.transport.start(this.id, this.activity).catch(error => {
        this.starting = null;
        throw error;
      });
    }
    return this.starting;
  }
  claim(): Promise<RewardResult> {
    if (this.result) return Promise.resolve(this.result);
    if (!this.claiming) {
      this.claiming = this.start()
        .then(() => this.transport.claimReward(this.id, this.activity))
        .then(result => { this.result = result; return result; })
        .finally(() => { this.claiming = null; });
    }
    return this.claiming;
  }
}

export function errorMessage(error: unknown, fallback: string) {
  return error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
    ? error.message : fallback;
}

