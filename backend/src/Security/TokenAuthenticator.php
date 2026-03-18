<?php

//ce fichier gère l'authentification via token JWT pour les utilisateurs authentifiés
namespace App\Security;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use App\Repository\UserRepository;

class TokenAuthenticator extends AbstractAuthenticator
{
    private string $jwtSecret;
    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository, string $jwtSecret = 'your-secret-key')
    {
        $this->userRepository = $userRepository;
        $this->jwtSecret = $jwtSecret;
    }

    public function supports(Request $request): ?bool
    {
        return $request->headers->has('Authorization');
    }

    public function authenticate(Request $request): Passport
    {
        $authHeader = $request->headers->get('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            throw new CustomUserMessageAuthenticationException('No token provided');
        }

        $token = substr($authHeader, 7);

        try {
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
        } catch (\Exception $e) {
            throw new CustomUserMessageAuthenticationException('Invalid token: ' . $e->getMessage());
        }

        $user = $this->userRepository->findOneBy(['user' => $decoded->username]);

        if (!$user) {
            throw new CustomUserMessageAuthenticationException('User not found');
        }

        if (!$user->isActive()) {
            throw new CustomUserMessageAuthenticationException('User account is disabled');
        }

        return new SelfValidatingPassport(
            new UserBadge($decoded->username)
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse([
            'error' => $exception->getMessageKey(),
            'message' => $exception->getMessage(),
        ], Response::HTTP_UNAUTHORIZED);
    }
}
