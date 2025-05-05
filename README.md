# LineageOS Updater Client

## Prerequisites 
* node.js & yarn

## Setting up the app
1. Create an environment file

Create a file named `.env.local`.

Example:
```
VITE_API_HOSTNAME=http://192.168.100.25:5000/
```
Replace `http://192.168.100.25:5000/` with the hostname of the updater server. Note: the trailing slash _is required_

2. Install all node modules

Run the following command:
```
yarn install
```

## Running the app
### Development

Run the following command:
```
yarn run dev
```
This will start a development server that watches for all file changes and live reloads the webpage.

### Production

Run the following command:
```
yarn run build
```
This will build the app and place all the static files into the `dist` subdirectory.
You can then serve the app with any static file server you want.

Example `nginx` configuration:
```
server {
        server_name updater.example.com;

        location / {
                root   /path/to/updater-client/dist;
                index  index.html;
                try_files $uri $uri/ /index.html;
        }
}
```
