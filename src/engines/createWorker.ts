import { Queue } from "./Queue";
import { MessageData, convert, HandleMethod } from "./handler";
import { avifCheck } from "./support";

/**
 * Create worker handler for compress or preview
 * @param method - "compress" | "preview"
 */
export function createWorkerHandler(method: HandleMethod) {
  return async () => {
    await avifCheck();
    const queue = new Queue(3);

    globalThis.addEventListener(
      "message",
      async (event: MessageEvent<MessageData>) => {
        queue.push(async () => {
          const output = await convert(event.data, method);
          if (output) {
            globalThis.postMessage(output);
          }
        });
      },
    );
  };
}
