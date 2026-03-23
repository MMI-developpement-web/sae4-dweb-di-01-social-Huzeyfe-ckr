<?php

// Test password verification
$testPassword = "Himmel87.";
$hashFromDb = '$2y$13$kqF4vQgv/kVjOgdouhuBzO5hUFvI2uB/joIOIGYHwtN/1QoGx2rWG';

echo "Testing password: " . $testPassword . "\n";
echo "Hash from DB: " . $hashFromDb . "\n\n";

// Test with password_verify (native PHP)
$verified = password_verify($testPassword, $hashFromDb);
echo "password_verify() result: " . ($verified ? "TRUE (✓ PASS)" : "FALSE (✗ FAIL)") . "\n";

// Test with Symfony UserPasswordHasher
require_once __DIR__ . '/vendor/autoload.php';

use Symfony\Component\PasswordHasher\Hasher\NativePasswordHasher;
use App\Entity\User;

$hasher = new NativePasswordHasher();
$user = new User();

$isValid = $hasher->verify($hashFromDb, $testPassword);
echo "Symfony hasher verify() result: " . ($isValid ? "TRUE (✓ PASS)" : "FALSE (✗ FAIL)") . "\n";
