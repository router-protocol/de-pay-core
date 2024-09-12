# Project Name

A brief description of your project.

## Installation

```bash
npm install @de-pay/core
```

## Usage

```typescript
import DePay from '@de-pay/core';
```

Initializes a new instance of the DePay class.

- `config`: An object containing:

  - `quoteUrl` (optional): Custom quote URL
  - `transactionUrl` (optional): Custom transaction URL
  - `partnerId`: Partner ID for DePay

  ```typescript
  const dePay = new DePay({
    quoteUrl: 'https://api-beta.pathfinder.routerprotocol.com/api/v2/quote',
    transactionUrl: 'https://btc-testnet.poap-nft.routernitro.com/internal',
    partnerId: 123456,
  });
  ```

## Methods

### getQuote

Retrieves a quote for a payment.

```typescript
const quote = await dePay.getQuote({
  amount: 100,
  currency: 'USD',
  partnerId: 123456,
});
```

### createTransaction

Creates a transaction for a payment.

```typescript
const transaction = await dePay.createTransaction({
  quote: quote,
  senderAddress: '0x1234567890123456789012345678901234567890',
  receiverAddress: '0x0987654321098765432109876543210987654321',
});
```

### Wait for transaction

Waits for a transaction to be confirmed.

```typescript
const transaction = await dePay.waitForTransaction(transaction.depositMeta);
```
