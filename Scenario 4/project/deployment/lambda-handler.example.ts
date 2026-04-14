/**
 * Example AWS Lambda handler (API Gateway HTTP API / REST proxy).
 * Bundle `src/` with esbuild so this handler can import the transformer.
 *
 * Not wired into npm scripts — copy or adapt when deploying.
 */

import { transformOrder, ValidationError } from '../src/index';

interface ApiGatewayProxyEvent {
  body: string | null;
}

interface ApiGatewayProxyResult {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export async function handler(
  event: ApiGatewayProxyEvent
): Promise<ApiGatewayProxyResult> {
  try {
    if (!event.body) {
      return json(400, { error: 'Missing body' });
    }
    const payload = JSON.parse(event.body) as Parameters<typeof transformOrder>[0];
    const shipiumOrder = transformOrder(payload);
    return json(200, shipiumOrder);
  } catch (e) {
    if (e instanceof SyntaxError) {
      return json(400, { error: 'Invalid JSON' });
    }
    if (e instanceof ValidationError) {
      return json(400, { error: e.message, type: 'ValidationError' });
    }
    return json(500, { error: 'Internal error' });
  }
}

function json(statusCode: number, body: unknown): ApiGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
