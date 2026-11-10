# ReadMore Bookstore API

A RESTful API built with Express.js, MongoDB, and Mongoose. This API manages Authors and Books, enforcing strict business rules and data relationships.

## Tech Stack
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose

## Setup Instructions
1. Clone the repo.
2. Run `npm install` to install dependencies.
3. Create a `.env` file in the root directory and add your connection string:
4. Run `npm run dev` to start the server on `http://localhost:3000`.

## API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/authors` | Create a new author |
| **GET** | `/authors` | Get all authors |
| **GET** | `/authors/:id` | Get one author by ID |
| **PUT** | `/authors/:id` | Update an author |
| **DELETE** | `/authors/:id` | Delete an author (Blocked if books exist) |
| **GET** | `/authors/:id/books` | Get all books by a specific author |
| **GET** | `/authors/:id/stats` | Get book statistics for an author |
| **POST** | `/books` | Create a new book |
| **GET** | `/books` | Get all books (supports filtering/pagination) |
| **GET** | `/books/:id` | Get one book by ID |
| **PUT** | `/books/:id` | Update a book |
| **DELETE** | `/books/:id` | Delete a book |

## Business Rules Implemented
- **No orphan books:** Rejects book creation if the `author` ID does not exist in the database (`400 Bad Request`).
- **No duplicate titles per author:** Case-insensitive check. The same author cannot have two books with the same title (`409 Conflict`).
- **Validation:** Rejects prices <= 0 and published years before 1450 or in the future (`422 Unprocessable Entity`).
- **Author Delete Policy (Option A - Block):** Returns `409 Conflict` if an author still has books linked to them. This prevents orphaned books and potential data loss for historical records.
- **Dynamic Filtering & Pagination:** `GET /books` supports dynamic combinations of `genre`, `minPrice`, `maxPrice`, `author`, `search`, `sort`, `order`, `page`, and `limit`.
- **Author Stats:** Calculates `bookCount`, `averagePrice`, `cheapestBook`, and `mostExpensiveBook`, handling the case where an author has no books.

## Video Walkthrough

