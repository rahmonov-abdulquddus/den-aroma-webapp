// MongoDB initialization script
db = db.getSiblingDB('quran_bot');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["telegramId", "firstName"],
      properties: {
        telegramId: {
          bsonType: "number",
          description: "must be a number and is required"
        },
        firstName: {
          bsonType: "string",
          description: "must be a string and is required"
        }
      }
    }
  }
});

db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "price"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        price: {
          bsonType: "number",
          minimum: 0,
          description: "must be a positive number and is required"
        }
      }
    }
  }
});

db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user", "products", "totalPrice"],
      properties: {
        user: {
          bsonType: "objectId",
          description: "must be an objectId and is required"
        },
        totalPrice: {
          bsonType: "number",
          minimum: 0,
          description: "must be a positive number and is required"
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ "telegramId": 1 }, { unique: true });
db.products.createIndex({ "name": "text", "description": "text" });
db.products.createIndex({ "categoryId": 1 });
db.products.createIndex({ "isActive": 1, "isApproved": 1 });
db.orders.createIndex({ "user": 1, "createdAt": -1 });
db.orders.createIndex({ "status": 1 });

print('Database initialized successfully!');
