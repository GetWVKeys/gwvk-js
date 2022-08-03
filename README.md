# gwvk-js

Javascript API Wrapper for GetWVKeys written in Typescript

## Example Usage

### Basic Usage

```js
const { Client } = require("../dist");

(async () => {
  const gwvk = new Client("your getwvkeys api key");
  const options = {
    licenseUrl: "https://cwip-shaka-proxy.appspot.com/no_auth",
    pssh: "AAAAp3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAAIcSEFF0U4YtQlb9i61PWEIgBNcSEPCTfpp3yFXwptQ4ZMXZ82USEE1LDKJawVjwucGYPFF+4rUSEJAqBRprNlaurBkm/A9dkjISECZHD0KW1F0Eqbq7RC4WmAAaDXdpZGV2aW5lX3Rlc3QiFnNoYWthX2NlYzViZmY1ZGM0MGRkYzlI49yVmwY=",
  };
  const keys = await gwvk.getKeys(options);
  console.log(keys);
})();
```

### Another way of doing the above

```js
const { Client, Session } = require("../dist");

(async () => {
  const gwvk = new Client("your getwvkeys api key");
  const options = {
    licenseUrl: "https://cwip-shaka-proxy.appspot.com/no_auth",
    pssh: "AAAAp3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAAIcSEFF0U4YtQlb9i61PWEIgBNcSEPCTfpp3yFXwptQ4ZMXZ82USEE1LDKJawVjwucGYPFF+4rUSEJAqBRprNlaurBkm/A9dkjISECZHD0KW1F0Eqbq7RC4WmAAaDXdpZGV2aW5lX3Rlc3QiFnNoYWthX2NlYzViZmY1ZGM0MGRkYzlI49yVmwY=",
  };
  const challenge = await gwvk.getChallenge(options);
  const session = new Session(gwvk, options, challenge);
  const license = await gwvk.getLicense(options, challenge.challenge);
  const keys = await session.provideLicense(license);
  console.log(keys);
})();
```

### Custom Build Info

```js
const options = {
  ...
  buildInfo:
    "Android/sdk_phone_x86_64/generic_x86_64:10/QSR1.210820.001/7663313:userdebug/test-keys",
};
```

### Custom Headers

Some sites might require the usage of custom headers, you can specify them here.

```js
const options = {
    ...
    headers: {
        "x-dt-customdata": "blah blah blah"
    }
};
```

### Key response

```json
{
  "keys": [
    {
      "added_at": 1659482857,
      "key": "517453862d4256fd8bad4f58422004d7:5b4b848eac0855d79165d05f3cf16d56",
      "license_url": "https://cwip-shaka-proxy.appspot.com"
    }
  ],
  "kid": "517453862d4256fd8bad4f58422004d7"
}
```

# TODO

- [ ] More options
  - [ ] Proxy Support
  - [ ] Ability to choose not to use privacy mode
- [ ] Method to search for cached keys
