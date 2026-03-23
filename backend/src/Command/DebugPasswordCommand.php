<?php

namespace App\Command;

use App\Repository\UserRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(name: 'app:debug:password', description: 'Debug password validation')]
class DebugPasswordCommand extends Command
{
    public function __construct(
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $user = $this->userRepository->findOneBy(['user' => 'testuser']);

        if (!$user) {
            $output->writeln('❌ User not found');
            return Command::FAILURE;
        }

        $output->writeln('✅ User found: testuser (ID: ' . $user->getId() . ')');
        $output->writeln('Password hash: ' . substr($user->getPassword(), 0, 50) . '...');
        $output->writeln('');

        $tests = [
            'TestAccount123!',
            'TestAccount123',
            'testuser',
        ];

        $output->writeln('--- Testing with Symfony passwordHasher ---');
        foreach ($tests as $pass) {
            $valid = $this->passwordHasher->isPasswordValid($user, $pass);
            $output->writeln('"' . $pass . '" => ' . ($valid ? '✅ VALID' : '❌ INVALID'));
        }

        $output->writeln('');
        $output->writeln('--- Testing with native PHP password_verify ---');
        foreach ($tests as $pass) {
            $valid = password_verify($pass, $user->getPassword());
            $output->writeln('"' . $pass . '" => ' . ($valid ? '✅ VALID' : '❌ INVALID'));
        }

        return Command::SUCCESS;
    }
}
