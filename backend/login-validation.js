// Import and configure environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import Supabase client
import {createClient} from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Validates user login credentials against Supabase database
 * @param {string} username - The username to validate
 * @param {string} password - The password to validate
 * @param {Function} callback - Callback function that receives (error, user)
 *                             If successful: error will be null, user will contain user data
 *                             If failed: error will contain error info, user will be null
 *                             If no match: both error and user will be null
 */
export default async function validateLogin(username, password, callback) {
    try {
        // Query accounts table for matching username and password
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('Username', username)
            .eq('Password', password);

        // Handle any database errors
        if (error) {
            console.error('Error fetching user:', error);
            return callback(error, null);
        }

        // If matching user found, return the user data
        if (data && data.length > 0) {
            const user = data[0];
            callback(null, user);
        } else {
            // No matching user found
            callback(null, null);
        }
    } catch (err) {
        // Handle any unexpected errors
        console.error('Error during validation:', err);
        callback(err, null);
    }
}