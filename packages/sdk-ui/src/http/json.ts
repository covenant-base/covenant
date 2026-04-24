type JsonPrimitive = string | number | boolean | null;
type JsonArray = JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractErrorMessage(payload: JsonValue | null): string | null {
  if (!payload || !isJsonObject(payload)) return null;
  const candidate = payload.error ?? payload.message;
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : null;
}

async function parseJsonResponse(response: Response): Promise<JsonValue | null> {
  const raw = await response.text();
  if (raw.length === 0) return null;
  try {
    return JSON.parse(raw) as JsonValue;
  } catch {
    // Don't silently coerce successful non-JSON responses to null.
    if (response.ok) throw new Error('invalid_json_response');
    return null;
  }
}

export async function getJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    credentials: 'include',
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const payload = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(extractErrorMessage(payload) ?? 'request failed');
  }
  if (payload === null) {
    throw new Error('empty_response');
  }
  return payload as T;
}
