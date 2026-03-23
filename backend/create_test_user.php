<?php
require_once __DIR__ . '/vendor/autoload.php';

use Symfony\Component\PasswordHasher\Hasher\NativePasswordHasher;

$testPassword = "TestAccount123!";
$hashedPassword = password_hash($testPassword, PASSWORD_BCRYPT, ['cost' => 13]);

echo "Insert this SQL into the database:\n\n";
echo "INSERT INTO \`user\` (user, email, password, name, role, active, created_at) VALUES ('testuser', 'test@example.com', '" . $hashedPassword . "', 'Test User', 'user', 1, NOW());\n\n";
echo "Then login with:\n";
echo "Username: testuser\n";
echo "Password: " . $testPassword . "\n";
