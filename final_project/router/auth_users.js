const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{ username: "admin", password: "123456" }];

const isValid = (username) => {
	//returns boolean
	//write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
	let validusers = users.filter((user) => {
		return user.username === username && user.password === password;
	});
	if (validusers.length > 0) {
		return true;
	} else {
		return false;
	}
};

//only registered users can login
regd_users.post("/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (!username || !password) {
		res.status(404).json({ message: "username and password required" });
	} else if (authenticatedUser(username, password)) {
		let accessToken = jwt.sign(
			{
				data: password,
			},
			"access",
			{ expiresIn: 60 * 60 }
		);

		req.session.authorization = {
			accessToken,
			username,
		};
		res.status(200).json({ message: "User logged in" });
	} else {
		res.status(208).json({ message: "Invalid credentials" });
	}
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
	try {
		const requestedIsbn = req.params.isbn;
		const reviewText = req.body.review;
		const username = req.session.authorization.username;
		if (!username) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const book = books[requestedIsbn];

		if (book) {
			book.reviews[username] = reviewText;
			res.json({ message: "Review added/modified successfully" });
		} else {
			res.status(404).json({ message: "Book not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
	try {
		const requestedIsbn = req.params.isbn;
		const username = "admin"; //req.session.authorization.username;

		if (!username) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const book = books[requestedIsbn];

		if (book) {
			if (book.reviews[username]) {
				delete book.reviews[username];
				res.json({ message: "Review deleted successfully" });
			} else {
				res.status(404).json({ message: "Review not found" });
			}
		} else {
			res.status(404).json({ message: "Book not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "INternal server error" });
	}
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
