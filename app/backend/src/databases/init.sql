/* ================================
   GREENLIFE STORE - POSTGRESQL DEMO
   ================================ */

BEGIN;

/* ---------- 1. CLEAN UP ---------- */
DROP TABLE IF EXISTS payments, order_items, orders, cart_items, carts,
addresses, products, categories, users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS product_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

/* ---------- 2. ENUM TYPES ---------- */
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE product_status AS ENUM ('active', 'inactive');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipping', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('momo', 'vnpay', 'paypal');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed');

/* ---------- 3. TABLES ---------- */
CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INT REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE products (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(id),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock INT NOT NULL CHECK (stock >= 0),
    image_url VARCHAR(255),
    status product_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE carts (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_time NUMERIC(10,2) NOT NULL,
    UNIQUE (cart_id, product_id)
);

CREATE TABLE orders (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    status order_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    price NUMERIC(10,2) NOT NULL
);

CREATE TABLE addresses (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_detail TEXT NOT NULL,
    city VARCHAR(50) NOT NULL
);

CREATE TABLE payments (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id INT UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    method payment_method NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    status payment_status DEFAULT 'pending',
    transaction_code VARCHAR(100),
    paid_at TIMESTAMP
);

/* ---------- 4. SAMPLE DATA ---------- */

/* USERS */
INSERT INTO users (full_name, email, password_hash, phone, role) VALUES
('Admin GreenLife','admin@greenlife.vn','hash_admin','0900000001','admin'),
('Staff GreenLife','staff@greenlife.vn','hash_staff','0900000002','admin'),
('Nguyen Van An','an@gmail.com','hash1','0911111111','customer'),
('Tran Thi Binh','binh@gmail.com','hash2','0922222222','customer'),
('Le Van Cuong','cuong@gmail.com','hash3','0933333333','customer'),
('Pham Thi Dao','dao@gmail.com','hash4','0944444444','customer'),
('Hoang Minh Duc','duc@gmail.com','hash5','0955555555','customer');

/* CATEGORIES */
INSERT INTO categories (name, description, parent_id) VALUES
('Đồ tái sử dụng','Reusable products',NULL),
('Mỹ phẩm thiên nhiên','Organic cosmetics',NULL),
('Gia dụng xanh','Eco home products',NULL),
('Bình nước','Reusable bottles',1),
('Túi vải','Canvas bags',1),
('Ống hút','Eco straws',1);

/* PRODUCTS */
INSERT INTO products (category_id,name,description,price,stock,image_url) VALUES
(4,'Bình inox 500ml','Giữ nhiệt 12h',199000,50,'b1.jpg'),
(4,'Bình tre 600ml','Tre tự nhiên',249000,30,'b2.jpg'),
(5,'Túi canvas','Tái sử dụng',79000,100,'t1.jpg'),
(6,'Ống hút tre','Sinh học',39000,200,'o1.jpg'),
(2,'Son thiên nhiên','Không chì',189000,60,'s1.jpg'),
(3,'Bàn chải tre','Eco',39000,200,'bc.jpg');

/* CARTS */
INSERT INTO carts (user_id)
SELECT id FROM users WHERE role='customer';

/* CART ITEMS */
INSERT INTO cart_items (cart_id,product_id,quantity,price_at_time) VALUES
(1,1,1,199000),
(1,3,2,79000),
(2,4,3,39000);

/* ORDERS */
INSERT INTO orders (user_id,total_amount,status) VALUES
(3,357000,'paid'),
(4,117000,'shipping');

/* ORDER ITEMS */
INSERT INTO order_items (order_id,product_id,quantity,price) VALUES
(1,1,1,199000),
(1,3,2,79000),
(2,4,3,39000);

/* PAYMENTS */
INSERT INTO payments (order_id,method,amount,status,transaction_code,paid_at) VALUES
(1,'momo',357000,'success','MOMO001',NOW()),
(2,'vnpay',117000,'success','VNPAY002',NOW());

COMMIT;
