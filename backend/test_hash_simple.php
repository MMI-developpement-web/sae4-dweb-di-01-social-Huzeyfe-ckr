<?php
require_once __DIR__ . '/vendor/autoload.php';

use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasher;
use Symfony\Component\PasswordHasher\Hasher\NativePasswordHasher;

$testPassword = "TestPassword123!";
$hasher = new NativePasswordHasher();

// Hash a password
$hashedPassword = password_hash($testPassword, PASSWORD_BCRYPT, ['cost' => 13]);

echo "Original password: " . $testPassword . "\n";
echo "Hashed password: " . $hashedPassword . "\n\n";

// Verify it
$verified = password_verify($testPassword, $hashedPassword);
echo "Verification result: " . ($verified ? "TRUE ✓" : "FALSE ✗") . "\n";

// Now test with wrong password
$wrongPassword = "WrongPassword";
$wrongVerified = password_verify($wrongPassword, $hashedPassword);
echo "Wrong password verification: " . ($wrongVerified ? "TRUE ✓" : "FALSE ✗") . "\n";
