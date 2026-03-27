import http from 'node:http'
import { createApp, createStore } from './app.js'

const port = Number(process.env.PORT || 3000)
const store = createStore()
const app = createApp(store)

http.createServer(app).listen(port, () => {
  console.log(`saas-billing-starter running on port ${port}`)
})