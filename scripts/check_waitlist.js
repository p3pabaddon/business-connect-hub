import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkColumns() {
  const { data, error } = await supabase.from('waitlist').select('*').limit(1);
  if (error) {
    console.error('Error fetching waitlist:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Columns in waitlist table:', Object.keys(data[0]));
  } else {
    // Try to get column information from a different table or just try an insert
    console.log('No data in waitlist table to check columns.');
    
    // Attempt an insert with 'date' to see if it works
    const { error: insertError } = await supabase.from('waitlist').insert({
        business_id: 'test',
        user_id: 'test',
        date: '2026-04-13',
    }).select();
    
    if (insertError) {
        console.log('Insert with "date" failed:', insertError.message);
    } else {
        console.log('Insert with "date" succeeded!');
    }

    const { error: insertError2 } = await supabase.from('waitlist').insert({
        business_id: 'test',
        user_id: 'test',
        desired_date: '2026-04-13',
    }).select();
    
    if (insertError2) {
        console.log('Insert with "desired_date" failed:', insertError2.message);
    } else {
        console.log('Insert with "desired_date" succeeded!');
    }
  }
}

checkColumns();
