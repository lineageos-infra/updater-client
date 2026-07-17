# LineageOS Updater Client

## Prerequisites 
* node.js & pnpm

## Setting up the app
1. Create an environment file

Create a file named `.env.local`.

Example:
```
VITE_API_HOSTNAME=http://192.168.100.25:5000/
VITE_BRAND_NAME=LineageOS
VITE_WIKI_URL=https://wiki.lineageos.org
```
Replace `http://192.168.100.25:5000/` with the hostname of the updater server. Note: the trailing slash _is required_

The following variables are optional and default to LineageOS branding when unset:
```
VITE_SIGNING_KEY_FINGERPRINT=72:96:32:27:d6:6c:4c:4d:5f:a0:91:6a:c2:2c:79:3c:d4:5f:43:5c
VITE_BRAND_COLOR_LIGHT="#cce8e9"
VITE_BRAND_COLOR_DARK="#324b4c"
VITE_BRAND_COLOR_PRIMARY="#167c80"
VITE_LOGO_SVG=<svg xmlns="http://www.w3.org/2000/svg" viewBox="..." width="100%" height="100%"><path d="..." /></svg>
VITE_FAVICON_URL="data:image/png;base64,..."
```
* `VITE_SIGNING_KEY_FINGERPRINT`: SHA-1 fingerprint of the public key OTA packages must be signed with
* `VITE_BRAND_COLOR_*`: brand theme colors
* `VITE_LOGO_SVG`: full `<svg>` markup for the sidebar/navbar logo, on a single line. Path fill colors are applied by the app, so omit `fill` attributes
* `VITE_FAVICON_URL`: favicon URL (a `data:` URI works well)

2. Install all node modules

Run the following command:
```
pnpm install
```

## Running the app
### Development

Run the following command:
```
pnpm run dev
```
This will start a development server that watches for all file changes and live reloads the webpage.

### Production

Run the following command:
```
pnpm run build
```
This will build the app and place all the static files into the `dist` subdirectory.
You can then serve the app with any static file server you want.

Example `nginx` configuration:
```nginx
server {
        server_name updater.example.com;

        location / {
                root   /path/to/updater-client/dist;
                index  index.html;
                try_files $uri $uri/ /index.html;
        }
}
```
