import {
  COMPARE_ROOT_SELECTOR,
  type CompareController,
} from "./compare-contract";
import { collectCompareElements } from "./compare-elements";
import { createCompareSession } from "./compare-session";

export type { CompareController } from "./compare-contract";

function mountCompareRoot(root: HTMLElement): CompareController {
  const elements = collectCompareElements(root);
  const windowValue = root.ownerDocument.defaultView;

  if (elements === null || windowValue === null) {
    return { destroy: (): void => undefined };
  }

  return createCompareSession(elements, windowValue);
}

export function mountCompareControllers(
  documentValue: Document = document,
): CompareController {
  const controllers = Array.from(
    documentValue.querySelectorAll<HTMLElement>(COMPARE_ROOT_SELECTOR),
    mountCompareRoot,
  );

  return {
    destroy: (): void => {
      for (const controller of controllers.toReversed()) {
        controller.destroy();
      }
    },
  };
}
