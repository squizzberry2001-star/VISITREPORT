import worker from '../../cloudflare/worker.mjs';

export function onRequest(context) {
  return worker.fetch(context.request, context.env, context);
}
