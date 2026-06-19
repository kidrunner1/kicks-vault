# 📘 Kicks Vault – Sneaker E-commerce Web App

Kicks Vault is a **full-stack e-commerce web application** for sneakers, built to practice and demonstrate core concepts in modern web development, including authentication, product management, and order systems.

---

## 🚀 Project Overview

This project focuses on building a **solid foundation of e-commerce logic**, such as:

* Authentication & Authorization
* Product & Inventory Management
* Cart & Order Flow
* Relational Database Design

> ⚠️ This is a **prototype version** — not production-ready yet.

---
## 🎯 Features
### ✅ Implemented
#### 👤 Authentication

* Register / Login
* Role-based access (USER / ADMIN)
* Cookie + Refresh Token

#### 👟 Product System

* Product listing & detail
* Brand relationship
* Images, specs, and sizes
* Featured products

#### ❤️ Favorite (Wishlist)

* Add / Remove favorite items
* Prevent duplicate using unique constraint

#### 🛒 Cart (Client-side)

* Built with Zustand
* Add product with size & quantity

#### 📦 Order System (Basic)

* Create order from cart
* OrderItem stores:

  * price (snapshot)
  * quantity
  * size

#### 📊 Inventory System

* Stock management per size (ShoeSize)

---

### ❌ Not Implemented Yet

* Payment System (Stripe / PromptPay)
* Shipping Address
* Real-time Order Tracking
* Cart persistence (database)

---

## 🧭 User Flow

```
Login / Register
      ↓
Browse Products
      ↓
View Product Detail
      ↓
Add to Cart (Zustand)
      ↓
Checkout
      ↓
Create Order + OrderItems
      ↓
Order Status = PENDING
```
---

## 🗄️ Database Design
### 🧩 Core Entities

* User
* Brand
* Shoe (Product)
* ShoeImage
* ShoeSpec
* ShoeSize (Inventory)
* Favorite
* Order
* OrderItem

### 🔗 Key Relationships

* User → Orders (1:M)
* Order → OrderItems (1:M)
* Shoe → ShoeSize (1:M)
* User ↔ Shoe (Favorite)

---
## 🧠 Design Decisions

* Use **OrderItem** to snapshot price and size at purchase time
* Use **Decimal** for price (avoid floating-point errors)
* Use **unique constraints** to prevent duplicate favorites
* Use **ShoeSize** for inventory per size
* Use **Zustand** for lightweight client-side cart

---

## ⚙️ Tech Stack
### Frontend

* React / Next.js
* Zustand (state management)

### Backend

* Node.js / Express

### Database

* PostgreSQL
* Prisma ORM

---

## 🔐 Authentication & Security

* Access Token (short-lived)
* Refresh Token (stored in HTTP-only cookie)
* Password hashing (bcrypt)
* Input validation (e.g., Zod / Joi)
* Protected API routes

---

## 📦 Order Flow (Technical)

```
Client Cart (Zustand)
        ↓
Checkout API
        ↓
Create Order
        ↓
Create OrderItems
        ↓
Calculate total
        ↓
(Update stock - planned improvement)
```

---

## ⚠️ Limitations

* No payment integration
* No shipping system
* Cart is not persistent across devices
* No real-time inventory sync

---

## 🛠️ Admin Capabilities

* Manage products (CRUD)
* Manage brands
* View and update orders
* Manage stock per size

---

## 📖 User Guide

### 👤 User

1. Register / Login
2. Browse products
3. Add to cart
4. Checkout
5. View order status

### 🛠️ Admin

* Add / Edit / Delete products
* Manage inventory
* Update order status

---

## 🚀 Future Improvements

* 💳 Payment Integration (Stripe / PromptPay)
* 📍 Shipping Address System
* 🔄 Persistent Cart (database)
* 📦 Real-time Order Tracking
* 📊 Admin Dashboard Analytics

---

## 💡 Key Learning Outcomes

* Full-stack architecture design
* Relational database modeling
* Authentication flow with tokens
* State management (client vs server)
* Building scalable e-commerce logic

---

## 📌 Author

Built as a **Full Stack Development Practice Project** to demonstrate real-world system design and implementation.

---

⭐ If you find this project useful, feel free to star the repo!
