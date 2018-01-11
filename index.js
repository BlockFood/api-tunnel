const express = require('express')
const axios = require('axios')
const tunnelSsh = require('tunnel-ssh')

module.exports = async ({ tunnels = [], routes = [], port = 1337 }) => {
    try {
        console.log(`api-tunnel :: open ${tunnels.length} tunnels..`)

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

        console.log(`api-tunnel :: create routes..`)
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
            next()
        })

        app.get('*', async (req, res) => {
            const selectedRoute = routes.find(route => route.regex.test(req.url))
            if (!selectedRoute) {
                console.log('404 for', req.method, req.url)
                res.status(404).send('Not found')
                return
            }

            const url = selectedRoute.transformUrl(req.url)
            console.log(`api-tunnel :: proxy ${req.url} -> ${url}`)

            try {
                const data = await axios({
                    method: req.method,
                    url
                })
                res.send(data.data)
            } catch(e) {
                res.status(e.status).send(e.body)
            }
        })

        await new Promise((resolve, reject) => app.listen(port, err => err ? reject(err) : resolve()))

        console.log(`api-tunnel :: started on port ${port}`)
        return app
    } catch (e) {
        console.log('api-tunnel :: Initialization failed')
        console.log('api-tunnel :: Initialization failed :: config = ', config)
        console.log('api-tunnel :: Initialization failed :: error = ', e)
        throw e
    }
}