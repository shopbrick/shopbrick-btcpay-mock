const fs = require('fs')

const FILE =
  './data/invoices.json'

function loadInvoices() {
  if (!fs.existsSync(FILE)) {
    return {}
  }

  return JSON.parse(
    fs.readFileSync(FILE, 'utf8')
  )
}

function saveInvoices(invoices) {
  fs.writeFileSync(
    FILE,
    JSON.stringify(
      invoices,
      null,
      2
    )
  )
}

module.exports = {
  loadInvoices,
  saveInvoices
}
