import { FiniteAnimationPlayer } from "@/motion/native/finite-animation-player";
import { REACTOR_NATIVE_EASING } from "./reactor-easing";

import type { ReactorNativeCue } from "./reactor-native-types";

export class ReactorNativePlayer {
  private readonly player: FiniteAnimationPlayer;

  constructor(options: {
    readonly documentValue: Document;
    readonly cues: readonly ReactorNativeCue[];
    readonly onComplete: () => void;
    readonly onFailure: (error: unknown) => void;
  }) {
    this.player = new FiniteAnimationPlayer({
      ...options,
      cues: options.cues.map((cue) => ({
        ...cue,
        easing: REACTOR_NATIVE_EASING[cue.ease],
      })),
      idPrefix: "gorilla-reactor",
      label: "Reactor",
    });
  }

  /** Construct every idle effect before starting the complete shared-clock group. */
  play(): void {
    this.player.play();
  }

  /** Cancel only effects owned by this transition; never commit presentation to CSS. */
  destroy(): void {
    this.player.destroy();
  }
}
