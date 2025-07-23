const { Client } = require('pg');

exports.handler = async (event) => {
    const { bookId, username } = JSON.parse(event.body);

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // 1. Check if the book is available
        const check = await client.query('SELECT status FROM books WHERE id = $1', [bookId]);

        if (check.rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Book not found.' })
            };
        }

        if (check.rows[0].status !== 'Available') {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Book is already borrowed.' })
            };
        }

        // 2. Update book status and set borrowed_by
        await client.query(
            'UPDATE books SET status = $1, borrowed_by = $2 WHERE id = $3',
            ['Borrowed', username, bookId]
        );

        // 3. Record the borrow in `borrowed_books` table
        await client.query(
            'INSERT INTO borrowed_books (username, book_id) VALUES ($1, $2)',
            [username, bookId]
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Book successfully borrowed.' })
        };

    } catch (err) {
        console.error('Database error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    } finally {
        await client.end();
    }
};
