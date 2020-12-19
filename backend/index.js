const express = require('express')
const app = express()
const port = 3000

// Client content is statically served
app.use(express.static('client'))

// Special case for static client index
app.get('/', (req, res) => {
    res.sendFile('client/html/index.html', { root: '.' })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})