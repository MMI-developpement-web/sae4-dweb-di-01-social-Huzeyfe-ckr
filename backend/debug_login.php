<?php

// Load Symfony autoloader
require_once __DIR__ . '/vendor/autoload.php';

// Set environment
$_SERVER['APP_ENV'] = $_SERVER['APP_ENV'] ?? 'dev';
$_SERVER['APP_DEBUG'] = $_SERVER['APP_DEBUG'] ?? '1';

// Create kernel and boot
$kernel = new App\Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();

$container = $kernel->getContainer();

// Get services
$userRepo = $container->get('App\Repository\UserRepository');
$passwordHasher = $container->get('Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface');

// Load testuser
$user = $userRepo->findOneBy(['user' => 'testuser']);

if (!$user) {
    echo "❌ User 'testuser' not found\n";
    exit(1);
}

echo "✅ User found: testuser (ID: " . $user->getId() . ")\n";
echo "Password hash: " . substr($user->getPassword(), 0, 50) . "...\n\n";

// Test passwords
$tests = [
    'TestAccount123!',
    'TestAccount123',
    'testuser',
];

echo "--- Testing with Symfony passwordHasher ---\n";
foreach ($tests as $pass) {
    $valid = $passwordHasher->isPasswordValid($user, $pass);
    echo "\"$pass\" => " . ($valid ? "✅ VALID" : "❌ INVALID") . "\n";
}

echo "\n--- Testing with native PHP password_verify ---\n";
foreach ($tests as $pass) {
    $valid = password_verify($pass, $user->getPassword());
    echo "\"$pass\" => " . ($valid ? "✅ VALID" : "❌ INVALID") . "\n";
}
