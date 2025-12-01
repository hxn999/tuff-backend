export function generateRandomPassword(): string {
  const length = 10;
  let characters = 'abcdefghijklmnopqrstuvwxyz';
  characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  characters += '0123456789';
  characters += '!@#$%';

  // Exclude characters that look similar (e.g., 'l', '1', 'I', 'o', '0', 'O')
  characters = characters.replace(/[l1Io0O]/g, '');

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }
  return password;
}
