from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import CartItem, Product, create_tables, get_db


class ProductDTO(BaseModel):
    name: str
    price: float
    description: str | None = None
    stock: int


class ProductUpdateDTO(BaseModel):
    name: str | None = None
    price: float | None = None
    description: str | None = None
    stock: int | None = None


class ProductResponseDTO(BaseModel):
    id: int
    name: str
    price: float
    description: str | None = None
    stock: int

    class Config:
        from_attributes = True


class CartItemResponseDTO(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_price: float
    quantity: int


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield



app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"]
)


@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI Template"}

@app.post("/products/", response_model=ProductResponseDTO)
async def create_product(product: ProductDTO, db: AsyncSession = Depends(get_db)):
    if product.stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot be negative")

    db_product = Product(
        name=product.name,
        price=product.price,
        description=product.description,
        stock=product.stock,
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product

@app.get("/products/", response_model=List[ProductResponseDTO])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    products = result.scalars().all()
    return products


@app.get("/products/{product_id}", response_model=ProductResponseDTO)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return product

@app.put("/products/{product_id}", response_model=ProductResponseDTO)
async def update_product(product_id: int, product_update: ProductUpdateDTO, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.dict(exclude_unset=True)
    if "stock" in update_data and update_data["stock"] < 0:
        raise HTTPException(status_code=400, detail="Stock cannot be negative")

    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    return product

@app.delete("/products/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    cart_item_result = await db.execute(
        select(CartItem).where(CartItem.product_id == product_id)
    )
    cart_item = cart_item_result.scalar_one_or_none()
    if cart_item is not None:
        await db.delete(cart_item)

    await db.delete(product)
    await db.commit()
    return {"message": "Product deleted successfully"}


@app.post("/cart/items/{product_id}", response_model=CartItemResponseDTO)
async def add_product_to_cart(product_id: int, db: AsyncSession = Depends(get_db)):
    product_result = await db.execute(select(Product).where(Product.id == product_id))
    product = product_result.scalar_one_or_none()

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock <= 0:
        raise HTTPException(status_code=400, detail="Product is out of stock")

    response_product_id = product.id
    response_product_name = product.name
    response_product_price = product.price

    product.stock -= 1

    cart_result = await db.execute(
        select(CartItem).where(CartItem.product_id == product_id)
    )
    cart_item = cart_result.scalar_one_or_none()

    if cart_item is None:
        cart_item = CartItem(product_id=product_id, quantity=1)
        db.add(cart_item)
    else:
        cart_item.quantity += 1

    await db.commit()
    await db.refresh(cart_item)

    return CartItemResponseDTO(
        id=cart_item.id,
        product_id=response_product_id,
        product_name=response_product_name,
        product_price=response_product_price,
        quantity=cart_item.quantity,
    )


@app.get("/cart/items/", response_model=List[CartItemResponseDTO])
async def get_cart_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CartItem, Product).join(Product, CartItem.product_id == Product.id)
    )
    rows = result.all()

    return [
        CartItemResponseDTO(
            id=cart_item.id,
            product_id=product.id,
            product_name=product.name,
            product_price=product.price,
            quantity=cart_item.quantity,
        )
        for cart_item, product in rows
    ]

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
