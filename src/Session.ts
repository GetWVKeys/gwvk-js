import { ChallengeResponse, Client, ErrorResponse, RequestOptions } from "./Client";
import { API_ENDPOINTS } from "./Constants";
import fetch from "node-fetch";

export interface SessionOptions {
  challenge: string;
  session_id: string;
}

export interface Key {
  added_at: number;
  key: string;
  license_url: string;
}

export interface KeysResponse {
  keys: Key[];
  kid: string;
}

export class Session {
  constructor(
    private readonly client: Client,
    public readonly requestOptions: RequestOptions,
    public readonly challengeData: ChallengeResponse
  ) {}

  async provideLicense(license: string): Promise<KeysResponse> {
    const { licenseUrl, pssh, headers, buildInfo } = this.requestOptions;
    const { session_id } = this.challengeData;

    return fetch(API_ENDPOINTS.PYWIDEVINE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.client.apiKey,
        ...headers,
      },
      body: JSON.stringify({
        license_url: licenseUrl,
        pssh,
        buildInfo,
        response: license,
        session_id,
      }),
    }).then(async (r) => {
      const json = await r.json();
      if (r.ok) {
        return json as KeysResponse;
      }
      throw new Error(`Failed to decrypt license: ${(json as ErrorResponse).message}`);
    });
  }
}
