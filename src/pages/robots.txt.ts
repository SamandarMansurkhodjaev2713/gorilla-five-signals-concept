import type { APIRoute } from "astro";

import { parsePublicEnvironment } from "@/config/environment";
import { createRobotsFile } from "@/config/release";

export const GET: APIRoute = () => {
  const environment = parsePublicEnvironment(import.meta.env);

  return new Response(createRobotsFile(environment.releaseMode), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
