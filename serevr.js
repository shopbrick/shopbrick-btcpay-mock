const express = require('express')
const { v4: uuid } = require('uuid')

const app = express()

app.set('view engine', 'ejs')

app.use(express.json())

const invoices = new Map()

app.post('/api/v1/stores/:storeId/invoices', (req, res) => {
  const id = uuid()

  const invoice = {
    id,
    status: 'New',
    metadata: req.body.metadata || {}
  }

  invoices.set(id, invoice)

  res.json({
    id,
    status: invoice.status,
    checkoutLink: `http://localhost:9000/pay/${id}`
  })
})

app.get('/api/v1/stores/:storeId/invoices/:id', (req, res) => {
  const invoice = invoices.get(req.params.id)

  if (!invoice) {
    return res.sendStatus(404)
  }

  res.json(invoice)
})

app.get('/pay/:id', (req, res) => {
  const invoice = invoices.get(req.params.id)

  if (!invoice) {
    return res.sendStatus(404)
  }

  res.render('invoice', {
    invoice
  })
})

app.post('/pay/:id/settle', (req, res) => {
  const invoice = invoices.get(req.params.id)

  invoice.status = 'Settled'

  res.redirect(`/pay/${invoice.id}`)
})

app.post('/pay/:id/expire', (req, res) => {
  const invoice = invoices.get(req.params.id)

  invoice.status = 'Expired'

  res.redirect(`/pay/${invoice.id}`)
})

app.listen(9000, () => {
  console.log(
    'shopbrick-btcpay-mock running on http://localhost:9000'
  )
})
