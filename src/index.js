import http from 'node:http'

const port = Number(process.env.PORT || 3000)

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ ok: true, service: 'saas-billing-starter' }))
    return
  }

  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ message: 'Scaffold inicial de saas-billing-starter' }))
})

server.listen(port, () => {
  console.log('saas-billing-starter running on port ' + port)
})