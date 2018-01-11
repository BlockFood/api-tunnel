# api-tunnel

Small dev utility that allows to programmatically compound an API using tunnels.

Perfect for setting up a bridge between prod and dev environment when needed.

## Install
```bash
npm install --save-dev api-tunnel
```

## Usage
```js
const apiTunnel = require('api-tunnel')

const configuration = {
    tunnels: [
        {
            username: '', // username on ssh server
            host: 'ssh.server', // distant ssh server
            port: 22, // ssh port on distant server
            dstPort: 25624, // distant port available from the distant server
            localHost: '127.0.0.1', // local host
            localPort: 25624, // local port
            privateKey, // ssh private key
            password, // OR password
        }
    ],
    routes: [
        {
            regex: /^match\.this/, // if the regex matches the url, then this route will be selected
            transformUrl: url => `actual/path/${url}` // transforms the url into the target url
        }
    ],
    port: 1337
}

try {
    await apiTunnel(configuration)
} catch(e) {
    console.log('Failed to setup tunnels & routes', e)
}
```