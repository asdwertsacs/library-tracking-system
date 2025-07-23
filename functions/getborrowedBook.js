const { Client } = require('pg');

exports.handler = async function (event) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const username = JSON.parse(event.body).username;

    try {
        await client.connect();
        const result = await client.query(`
      SELECT b.id, b.title 
      FROM books b 
      JOIN borrowed br ON br.book_id = b.id 
      WHERE br.username = $1 AND b.status = 'Borrowed'
    `, [username]);

        await client.end();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows)
        };
    } catch (error) {
        console.error("DB error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to load borrowed books." })
        };
    }
};
