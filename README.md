# shopbrick-btcpay-mock

Mock BTCPay Server implementation for local ShopBrick development.

The mock implements the minimum API required by ShopBrick:

* Create invoice
* Get invoice
* Simulate payment
* Simulate expiration

## Installation

```bash
git clone https://github.com/shopbrick/shopbrick-btcpay-mock.git

cd shopbrick-btcpay-mock

npm install
```

## Run

```bash
npm run dev
```

Server:

```text
http://localhost:9000
```

## Supported API

### Create Invoice

```http
POST /api/v1/stores/:storeId/invoices
```

### Get Invoice

```http
GET /api/v1/stores/:storeId/invoices/:id
```

## Payment UI

Every invoice returns:

```json
{
  "checkoutLink": "http://localhost:9000/pay/<invoice-id>"
}
```

Open the link in a browser.

You can:

* Mark invoice as Settled
* Mark invoice as Expired

This allows full end-to-end testing of:

```text
ShopBrick
  -> Worker
  -> Mock BTCPay
  -> Checkout
  -> Redirect
  -> Invoice Status
```

without running a real BTCPay Server.
