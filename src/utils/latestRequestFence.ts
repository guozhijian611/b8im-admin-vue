export interface LatestRequestFence {
  begin(): number
  cancel(): void
  isCurrent(generation: number): boolean
}

export function createLatestRequestFence(): LatestRequestFence {
  let generation = 0

  const advance = () => {
    generation += 1
    return generation
  }

  return {
    begin: advance,
    cancel() {
      advance()
    },
    isCurrent(candidate: number) {
      return candidate === generation
    }
  }
}
