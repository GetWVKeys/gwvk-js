import { API_ENDPOINTS, DEFAULT_CLIENT_OPTIONS } from "./Constants";
import { KeysResponse, Session } from "./Session";
import fetch from "node-fetch";

export interface ClientOptions {}

export interface ChallengeResponse {
  challenge: string;
  session_id: string;
}

export interface RequestOptions {
  licenseUrl: string;
  pssh: string;
  headers?: { [key: string]: string };
  proxy?: string;
  buildInfo?: string;
}

export interface ErrorResponse {
  error: boolean;
  code: number;
  message: string;
}

export class Client {
  constructor(
    public readonly apiKey: string,
    public readonly options: ClientOptions = DEFAULT_CLIENT_OPTIONS
  ) {}

  /**
   * Retrieves a server certificate from the license server. Used to encrypt client info. (AKA Privacy Mode)
   * @returns {Promise<string>}
   */
  async getServerCertificate(options: RequestOptions): Promise<string> {
    const { licenseUrl, headers } = options;
    return fetch(licenseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/ocet-stream",
        ...headers,
      },
      body: Buffer.from("CAQ=", "base64"),
    }).then(async (r) => {
      if (r.ok) {
        const buffer = await r.arrayBuffer();
        return Buffer.from(buffer).toString("base64");
      }
      const text = await r.text();
      throw new Error(`Failed to get server certificate: ${text}`);
    });
  }

  /**
   * Generates a License challenge from the API.
   * @returns {Promise<ChallengeResponse>}
   */
  async getChallenge(options: RequestOptions): Promise<ChallengeResponse> {
    const { licenseUrl, pssh, headers, buildInfo } = options;
    const serverCertificate = await this.getServerCertificate(options);
    return fetch(API_ENDPOINTS.PYWIDEVINE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        ...headers,
      },
      body: JSON.stringify({
        license_url: licenseUrl,
        pssh,
        certificate: serverCertificate,
        buildInfo,
        cache: false,
      }),
    }).then(async (r) => {
      const json = await r.json();
      if (r.ok) {
        return json as ChallengeResponse;
      }
      throw new Error(`Failed to get challenge: ${(json as ErrorResponse).message}`);
    });
  }

  async getLicense(options: RequestOptions, challenge: string): Promise<string> {
    const { licenseUrl, headers } = options;
    return fetch(licenseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/ocet-stream",
        ...headers,
      },
      body: Buffer.from(challenge, "base64"),
    }).then(async (r) => {
      if (r.ok) {
        const buffer = await r.arrayBuffer();
        return Buffer.from(buffer).toString("base64");
      }
      const text = await r.text();
      throw new Error(`Failed to get license: ${text}`);
    });
  }

  async getKeys(options: RequestOptions): Promise<KeysResponse> {
    const challenge = await this.getChallenge(options);
    const session = new Session(this, options, challenge);
    const license = await this.getLicense(options, challenge.challenge);
    return session.provideLicense(license);
  }
}
