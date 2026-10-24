# Product CRUD API (Postman / Thunder Client)

Base URL: `http://localhost:4000/api/products`

All endpoints require an administrator login token. Add this header to each request:

`Authorization: Bearer YOUR_ADMIN_TOKEN`

Also use `Content-Type: application/json` for POST and PATCH requests.

## 1. GET all products
- Method: `GET`
- URL: `http://localhost:4000/api/products`
- Returns `{ "ok": true, "count": 1, "products": [...] }`

## 2. GET one product
- Method: `GET`
- URL: `http://localhost:4000/api/products/PRODUCT_ID`
- Replace `PRODUCT_ID` with the product `_id` returned by GET all products.

## 3. POST create a product
- Method: `POST`
- URL: `http://localhost:4000/api/products`
- Body -> raw -> JSON:

```json
{
  "productName": "Keyboard",
  "productCode": "KEY-101",
  "category": "Electronics",
  "price": 1500,
  "quantity": 10,
  "supplier": "ABC Supplier",
  "minimumStock": 5,
  "warehouseLocation": "Rack B-1"
}
```

`productName`, `productCode`, `category`, and `price` are required. `quantity` defaults to 0, `minimumStock` defaults to 5, and supplier/location default to empty strings. `productCode` must be unique.

## 4. PATCH update a product
- Method: `PATCH`
- URL: `http://localhost:4000/api/products/PRODUCT_ID`
- Body -> raw -> JSON (send only the fields to change):

```json
{
  "price": 1750,
  "warehouseLocation": "Rack C-2"
}
```

## 5. DELETE a product
- Method: `DELETE`
- URL: `http://localhost:4000/api/products/PRODUCT_ID`
- Deletes the product and its related stock transaction and purchase request history.

## Start the project
1. Install Node.js and MongoDB, and make sure MongoDB is running.
2. Copy `backend/.env.example` to `backend/.env` and set your own `JWT_SECRET` and MongoDB URI.
3. In the project root run `npm run install:all`.
4. Run `npm run dev`.
5. Sign in through the app and use the admin token in Postman. Do not share the token or `.env` file.

## Notes
- `401` means the token is missing/invalid; `403` means the account is not an admin.
- `404` means the product ID does not exist or the endpoint URL is incorrect.
- `409` means the product code already exists.
- Do not send a trailing slash to the base URL unnecessarily; use the exact URLs above.
