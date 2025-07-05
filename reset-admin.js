// Quick script to reset admin password
import { resetAdminPassword } from './server/auth.js';

async function main() {
  try {
    const result = await resetAdminPassword('admin123');
    console.log('Password reset result:', result);
    process.exit(0);
  } catch (error) {
    console.error('Failed to reset password:', error);
    process.exit(1);
  }
}

main();