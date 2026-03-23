<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Repository\UserRepository;

class AdminLoginAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function supports(Request $request): ?bool
    {
        return $request->getPathInfo() === '/admin/login' && $request->isMethod('POST');
    }

    public function authenticate(Request $request): Passport
    {
        $username = $request->request->get('username');
        $password = $request->request->get('password');

        if (!$username || !$password) {
            throw new CustomUserMessageAuthenticationException('Identifiant et mot de passe requis');
        }

        // Load user by username
        $user = $this->userRepository->findOneBy(['user' => $username]);

        if (!$user) {
            throw new CustomUserMessageAuthenticationException('Identifiant ou mot de passe incorrect');
        }

        // Check if user is admin
        if (!in_array('ROLE_ADMIN', $user->getRoles())) {
            throw new CustomUserMessageAuthenticationException('Accès refusé. Admin uniquement');
        }

        // Return passport with password credentials to validate
        return new Passport(
            new UserBadge($username),
            new PasswordCredentials($password)
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        // Redirect to admin posts management after successful login
        $baseUrl = $request->getBaseUrl();
        $url = $baseUrl . '/admin/post';
        return new \Symfony\Component\HttpFoundation\RedirectResponse($url);
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        $baseUrl = $request->getBaseUrl();
        $url = $baseUrl . '/admin/login?error=' . urlencode($exception->getMessageKey());
        return new \Symfony\Component\HttpFoundation\RedirectResponse($url);
    }
}
