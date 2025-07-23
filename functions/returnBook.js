const { Client } = require('pg');

exports.handler = async function (event) {
    const { bookId, username } = JSON.parse(event.body);
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        await client.query('UPDATE books SET status = $1 WHERE id = $2', ['Available', bookId]);
        await client.query('DELETE FROM borrowed WHERE book_id = $1 AND username = $2', [bookId, username]);

        await client.end();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Book returned successfully." })
        };
    } catch (err) {
        console.error("Return error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to return book." })
        };
    }
};
