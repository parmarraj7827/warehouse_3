# Warehouse Management - Live Change Exam Update

## Change implemented
Added `warehouseLocation` to Product and connected it through the Model -> Controller -> PATCH Route -> React Edit Form flow.

## Files changed/added
- `backend/models/Product.js` - added `warehouseLocation` field.
- `backend/controllers/productController.js` - new controller for PATCH product update.
- `backend/routes/productRoutes.js` - new `PATCH /api/products/:id` route.
- `backend/server.js` - registers the new route and exposes `warehouseLocation` in formatted products; existing UPDATE_PRODUCT also preserves it.
- `frontend/src/services/backend.js` - added `updateProductAPI()`.
- `frontend/src/pages/admin/EditProduct.jsx` - uses PATCH API and edits warehouse location.
- `frontend/src/pages/admin/AddProduct.jsx` - allows location when creating a product.
- `frontend/src/pages/admin/Products.jsx` - displays warehouse location in product details.

## Thunder Client
Method: PATCH
URL: `http://localhost:4000/api/products/PRODUCT_ID`
Header: `Content-Type: application/json`
Header: `Authorization: Bearer YOUR_TOKEN`

Body:
```json
{
  "productName": "Laptop",
  "productCode": "LAP001",
  "category": "Electronics",
  "price": 50000,
  "supplier": "Dell",
  "minimumStock": 5,
  "warehouseLocation": "A-101"
}
```
