const express = require('express')
const axios = require('axios')
const tunnelSsh = require('tunnel-ssh')


module.exports = async ({ tunnels = [], routes = [], port = 1337 }) => {
    try {
        tunnels = tunnels.map(tunnel => {
            tunnel.keepAlive = true
            return tunnel
        })
        await Promise.all(tunnels.map(
            tunnel => new Promise(
                (resolve, reject) => tunnelSsh(
                    tunnel, (error, server) => error ? reject(error) : resolve(server)
                )
            )
        ))

        const app = express()

        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
            next()
        })

        app.all('*', async (req, res) => {
            console.log(req.method, req.url)

            const selectedRoute = routes.find(route => route.regex.test(req.url))
            if (!selectedRoute) {
                console.log('404 for', req.url)
                res.status(404).send('Not found')
                return
            }

            const url = selectedRoute.transformUrl(req.url)

            const data = await axios({
                method,
                url
            })
            res.send(data.data)
        })

        return await new Promise((resolve, reject) => app.listen(port, (err, server) => {}))

    } catch (e) {
        console.log('api-tunnel :: Initialization failed')
        console.log('api-tunnel :: Initialization failed :: config = ', config)
        console.log('api-tunnel :: Initialization failed :: error = ', e)
        throw e
    }
}