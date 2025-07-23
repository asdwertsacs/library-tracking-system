const { Client } = require('pg');

exports.handler = async function (event) {
    const { username } = JSON.parse(event.body);

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const result = await client.query(
            'SELECT * FROM books WHERE borrowed_by = $1',
            [username]
        );
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
