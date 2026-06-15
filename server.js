const express = require('express')
const {v4: uuid} = require('uuid')
const {loadInvoices, saveInvoices} = require('./src/storage')
const {buildRedirectUrl, calculateAmount} = require('./src/invoice')

const app = express()
app.set('view engine', 'ejs')
app.use(express.json())

const invoices = new Map(Object.entries(loadInvoices()))

app.post('/api/v1/stores/:storeId/invoices', (req, res) => {
  const id = uuid()

  const invoice = {
    id,
    amount: calculateAmount(req.body.metadata?.cart),
    status: 'New',
    createdAt: new Date().toISOString(),
    metadata: req.body.metadata || {},

    checkout: {
      redirectURL:
        req.body.checkout?.redirectURL,

      redirectAutomatically:
        req.body.checkout?.redirectAutomatically ??
        false
    }
  }

  invoices.set(id, invoice)

  saveInvoices(Object.fromEntries(invoices))

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

  if (!invoice) {
    return res.sendStatus(404)
  }

  invoice.status = 'Settled'

  saveInvoices(Object.fromEntries(invoices))

  const redirectUrl =
    buildRedirectUrl(invoice)

  if (
    redirectUrl &&
    invoice.checkout
      .redirectAutomatically
  ) {
    return res.redirect(redirectUrl)
  }

  res.redirect(`/pay/${invoice.id}`)
})

app.post('/pay/:id/expire', (req, res) => {
  const invoice = invoices.get(req.params.id)

  if (!invoice) {
    return res.sendStatus(404)
  }

  invoice.status = 'Expired'

  const redirectUrl =
    buildRedirectUrl(invoice)

  if (
    redirectUrl &&
    invoice.checkout
      .redirectAutomatically
  ) {
    return res.redirect(redirectUrl)
  }

  res.redirect(`/pay/${invoice.id}`)
})

app.get('/pay/:id/return', (req, res) => {
  const invoice = invoices.get(req.params.id)

  if (!invoice) {
    return res.sendStatus(404)
  }

  const redirectUrl =
    buildRedirectUrl(invoice)

  if (!redirectUrl) {
    return res.sendStatus(400)
  }

  res.redirect(redirectUrl)
})

app.get('/invoices', (req, res) => {
  const rows = Array.from(invoices.values())
  const stats = {
    total: rows.length,
    settled: rows.filter(x => x.status === 'Settled').length,
    expired: rows.filter(x => x.status === 'Expired').length
  }
  res.render('invoices', {invoices: rows, stats})
})

app.listen(9000, () => {
  console.log(
    'shopbrick-btcpay-mock running on http://localhost:9000'
  )
})
