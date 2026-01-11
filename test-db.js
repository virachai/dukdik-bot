const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error('❌ Error: DATABASE_URL is not defined in .env file');
        process.exit(1);
    }

    console.log('🔌 Connecting to database...');

    // Neon requires SSL. We'll mirror the logic used in NestJS.
    const client = new Client({
        connectionString: databaseUrl,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connection successful!');

        // Run a simple query
        const res = await client.query('SELECT NOW() as current_time, VERSION() as version');
        console.log('🕒 DB Time:', res.rows[0].current_time);
        console.log('📦 DB Version:', res.rows[0].version.split(',')[0]);

        // Check for our tables
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        if (tablesRes.rows.length > 0) {
            console.log('📁 Existing Tables:', tablesRes.rows.map(r => r.table_name).join(', '));
        } else {
            console.log('ℹ️ No tables found in the public schema yet (they will be created when the bot starts).');
        }

    } catch (err) {
        console.error('❌ Connection failed!');
        console.error('Error Details:', err.message);
    } finally {
        await client.end();
        console.log('🚪 Connection closed.');
    }
}

testConnection();
