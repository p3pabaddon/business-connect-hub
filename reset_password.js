
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szlkjqamknjiwlwtaxpw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bGtqcWFta25qaXdsd3RheHB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDcwNzM4MywiZXhwIjoyMDkwMjgzMzgzfQ.JPVVZtUTzSKWhGKKHkEK1JDscz6xdctE1NrluDEik1Q';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function resetPassword() {
  const email = 'admin@admin.com';
  const newPassword = 'Admin123!';

  console.log(`Resetting password for ${email}...`);

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    console.error(`User ${email} not found.`);
    return;
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (updateError) {
    console.error('Error updating password:', updateError);
  } else {
    console.log('Password successfully reset to Admin123!');
  }
}

resetPassword();
