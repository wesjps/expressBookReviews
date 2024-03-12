const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	console.log(req.body);

	if (!username || !password) {
		res.status(404).json({ message: "Username and Password must be provided" });
	} else if (users.find((e) => e.username === username)) {
		res.status(404).json({ message: "User already exists" });
	} else {
		users.push({ username, password });

		res.status(200).json({ message: "User registered." });
	}
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
	try {
		const bookList = books;
		res.status(200).json(bookList);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error retrieving book list" });
	}
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
	try {
		const requestedIsbn = req.params.isbn;
		const book = books[requestedIsbn];
		if (book) {
			res.status(200).json(book);
		} else {
			res.status(404).json({ message: "Book not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
	try {
		const requestedAuthor = req.params.author;
		const matchingBooks = [];
		const booksKeys = Object.keys(books);

		for await (const key of booksKeys) {
			const book = books[key];
			if (book.author.includes(requestedAuthor)) {
				matchingBooks.push(book);
			}
		}

		if (matchingBooks.length > 0) {
			res.status(200).json(matchingBooks);
		} else {
			res.status(404).json({ message: "No books found for this author" });
		}
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
	try {
		const requestedTitle = req.params.title.toLowerCase();
		const matchingBooks = [];
		const booksKeys = Object.keys(books);

		for await (const key of booksKeys) {
			const book = books[key];

			if (book.title.toLowerCase().includes(requestedTitle)) {
				matchingBooks.push(book);
			}
		}

		if (matchingBooks.length > 0) {
			res.status(200).json(matchingBooks);
		} else {
			res.status(404).json({ message: "No books found with this title" });
		}
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
	try {
		const requestedIsbn = req.params.isbn;
		const book = books[requestedIsbn];

		if (book) {
			const reviews = book.reviews;
			res.status(200).json(reviews);
		} else {
			res.status(404).json({ message: "Book not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
});

module.exports.general = public_users;
