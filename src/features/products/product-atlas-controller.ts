import {
  ATLAS_ROOT_SELECTOR,
  type AtlasController,
} from "./product-atlas-contract";
import { collectAtlasElements } from "./product-atlas-elements";
import { createAtlasSession } from "./product-atlas-session";

function mountAtlasRoot(root: HTMLElement): AtlasController | null {
  const elements = collectAtlasElements(root);
  const windowValue = root.ownerDocument.defaultView;
  return elements === null || windowValue === null
    ? null
    : createAtlasSession(elements, windowValue);
}

export function mountProductAtlases(
  documentValue: Document = document,
): AtlasController {
  const controllers = Array.from(
    documentValue.querySelectorAll<HTMLElement>(ATLAS_ROOT_SELECTOR),
  ).flatMap((root) => {
    const controller = mountAtlasRoot(root);
    return controller === null ? [] : [controller];
  });

  return {
    destroy: (): void => {
      for (const controller of controllers.toReversed()) controller.destroy();
    },
  };
}
