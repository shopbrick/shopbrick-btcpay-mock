function buildRedirectUrl(invoice) {
  if (!invoice.checkout?.redirectURL) {
    return null
  }

  const url = new URL(
    invoice.checkout.redirectURL
  )

  url.searchParams.set(
    'invoiceId',
    invoice.id
  )

  url.searchParams.set(
    'status',
    invoice.status
  )

  return url.toString()
}

function calculateAmount(cart = []) {
  return cart.reduce(
    (sum, item) =>
      sum + item.qty * item.price,
    0
  )
}

module.exports = {
  buildRedirectUrl,
  calculateAmount
}
