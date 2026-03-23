<?php
require_once __DIR__ . '/config/bootstrap.php';

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

// Get the Symfony container
$kernel = new \App\Kernel($_ENV['APP_ENV'], (bool) $_ENV['APP_DEBUG']);
$kernel->boot();
$container = $kernel->getContainer();

$userRepo = $container->get(UserRepository::class);
$passwordHasher = $container->get(UserPasswordHasherInterface::class);

// Load testuser from DB
$user = $userRepo->findOneBy(['user' => 'testuser']);

if (!$user) {
    echo "❌ User 'testuser' not found in database\n";
    exit(1);
}

echo "✅ User found: testuser (ID: " . $user->getId() . ")\n";
echo "Password hash from DB: " . substr($user->getPassword(), 0, 50) . "...\n\n";

// Test with different passwords
$testPasswords = [
    'TestAccount123!',
    'TestAccount123',
    'testuser',
    'test',
];

foreach ($testPasswords as $testPass) {
    $result = $passwordHasher->isPasswordValid($user, $testPass);
    echo "Password: \"$testPass\" => " . ($result ? "✅ VALID" : "❌ INVALID") . "\n";
}

// Also test with native PHP password_verify  
echo "\n--- Test with native PHP password_verify ---\n";
foreach ($testPasswords as $testPass) {
    $result = password_verify($testPass, $user->getPassword());
    echo "Password: \"$testPass\" => " . ($result ? "✅ VALID" : "❌ INVALID") . "\n";
}
