require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function validateLogin(username, password, callback) {
    try {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('Username', username)
            .eq('Password', password);

        if (error) {
            console.error('Error fetching user:', error);
            return callback(error, null);
        }

        if (data && data.length > 0) {
            const user = data[0];
            callback(null, user);
        } else {
            callback(null, null);
        }
    } catch (err) {
        console.error('Error during validation:', err);
        callback(err, null);
    }
}

module.exports = validateLogin;