const { Client } = require('pg');

exports.handler = async function () {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM books ORDER BY id');
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };
  } catch (error) {
    console.error("DB error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to load books." })
    };
  } finally {
    await client.end();
  }
};