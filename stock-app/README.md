# Stock Management (Mobile)

Expo React Native app for stock operators: login, check-in/out with photo and location, dashboard, transfer and attendance history.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your API URL and Geoapify key
npx expo start
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL (must end with `/`, e.g. `https://api.example.com/api/`) |
| `EXPO_PUBLIC_GEOAPI_KEY` | [Geoapify](https://www.geoapify.com/) key for reverse geocoding on check-in |

For **EAS production builds**, set the same variables in the [EAS project environment](https://docs.expo.dev/eas/environment-variables/) — local `.env` is not uploaded automatically.

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://your-api.example.com/api/"
eas secret:create --scope project --name EXPO_PUBLIC_GEOAPI_KEY --value "your_key"
```

## Production build

```bash
npm run lint
eas build --profile production --platform android
# or --platform ios
```

Before store release:

1. Use **HTTPS** for the API and remove `usesCleartextTraffic` from `app.json` once the server supports TLS.
2. Rotate any API keys that were ever committed to git.
3. Ensure `EXPO_PUBLIC_API_URL` is set in EAS (no localhost fallback in release builds).

## Scripts

- `npm start` — Expo dev server
- `npm run android` / `npm run ios` — native run
- `npm run lint` — ESLint
