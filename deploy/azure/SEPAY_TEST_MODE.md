# SePay Webhooks Test Mode (2026-10-31)

This integration uses simulated bank transactions, not SePay Payment Gateway checkout.
Do not transfer real money or scan this demo QR with a real banking app.

## Dashboard configuration

In **Test mode → Tích hợp Webhook → Thêm mới**:

- URL: `https://luminovels-prm393-demo.japaneast.cloudapp.azure.com/api/payments/sepay/test/webhook`
- Event: incoming money (Tiền vào).
- Account: Vietcombank / `0000000001` / LUMI NOVELS (simulated account).
- Official simulated VA: `SBSEPAYPENKMHSVIRUK`. The dashboard requires this VA for
  the selected Vietcombank household-business account. Choose the same VA in the simulator.
- Body format: JSON (`application/json`).
- Authentication: **API Key** (matches the user's current dashboard configuration).
- Key: copy the value of `SEPAY_WEBHOOK_API_KEY` from the ignored local
  `deploy/azure/.env`, without its surrounding quotes. Do not paste it into chat or commit it.
- Enable the webhook and retries. Disable the “only send transactions with payment code” filter;
  the backend extracts its full `NV...` identifier from `content` itself.

The API Access token is a separate credential and is not needed for this inbound webhook.
SePay sends `Authorization: Apikey <key>`. Missing or incorrect keys are rejected.
This authentication mode uses HTTPS; it does not provide per-payload HMAC verification.
HMAC remains available by setting `SEPAY_WEBHOOK_AUTH_MODE=hmac` and configuring the
matching `SEPAY_WEBHOOK_SECRET` on both sides; modes are explicit, with no unauthenticated fallback.

## End-to-end demo

1. Install the updated SePay APK and sign in.
2. Open the coin shop, choose a package and create an order.
3. Keep the order dialog open. Copy the entire `NV` payment code and note the displayed amount.
4. In **SePay Test mode → Mô phỏng giao dịch**, choose the simulated Vietcombank account,
   VA `SBSEPAYPENKMHSVIRUK`, **Tiền vào**, the exact amount, and paste the complete payment code into the transfer content.
5. Submit the simulation. In webhook delivery history expect HTTP 200 and `{"success":true}`.
6. Back in the app, tap **Kiểm tra số dư**. The order must be `COMPLETED` before the balance refreshes.
   If the order dialog was already dismissed, tap the refresh icon **Làm mới số dư**
   in the coin-shop app bar, or pull down to refresh.

Use a newly created order for each new simulation. Replaying a successful webhook does not
credit coins again. A different order cannot reuse an already consumed SePay transaction ID.
Wrong amounts/accounts do not credit coins. Expired/cancelled orders do not credit coins.
An HTTP 200 acknowledgement for an unrelated transaction does not mean an order was paid.

## Runtime configuration

The private VM environment needs `PAYMENT_PROVIDER=sepay`, `SEPAY_BANK_CODE=VCB`,
`SEPAY_BANK_NAME=Vietcombank`, `SEPAY_ACCOUNT_NUMBER=0000000001`,
`SEPAY_VIRTUAL_ACCOUNT=SBSEPAYPENKMHSVIRUK`,
`SEPAY_WEBHOOK_AUTH_MODE=apikey`, and `SEPAY_WEBHOOK_API_KEY`.
Keep these settings aligned with the Test mode webhook. Existing MoMo credentials can remain
in the environment but are not used for new SePay orders.

`sepay_test_receipts` records consumed transaction IDs atomically with payment, order,
coin balance, and coin ledger updates. Back up SQL Server before the first schema update.
Run the additive `Backend/scripts/add-sepay-test-receipts.sql` migration and keep
`JPA_DDL_AUTO=validate` on the deployed service.

The parent bank account remains `0000000001` in webhook `accountNumber`.
The official VA must match `subAccount` exactly. QR generation uses the configured VA as
the recipient. Other VA values or a missing VA are rejected while VA configuration is enabled.
An empty VA setting retains support for accounts that do not use a VA. No APK rebuild is
needed when changing the bank/VA configuration; new orders receive the updated QR from the API.

## Troubleshooting

- 401: check API Key mode and matching `SEPAY_WEBHOOK_API_KEY`; this is not the API Access token.
- 400: check exact amount, simulated account, JSON format, and unambiguous full payment code.
- 404: check the URL and deployed backend version.
- HTTP 200 but order remains pending: inspect the payment code and direction; unrelated
  transactions are acknowledged without changing balances. Check whether the order/payment expired.

Verified locally: HMAC/API Key checks, amount/account/VA validation, duplicate protection,
and real HTTP → H2 transaction commit/replay checks. A dashboard-originated simulated
transfer was verified on Azure SQL: order COMPLETED, payment SUCCESS, balance 100 coins,
one receipt and one ledger credit. The coin-shop refresh test also covers stale balance display.

Official documentation:
- https://developer.sepay.vn/vi/sepay-webhooks/test-mode/bat-dau-nhanh
- https://developer.sepay.vn/vi/sepay-webhooks/xac-thuc
