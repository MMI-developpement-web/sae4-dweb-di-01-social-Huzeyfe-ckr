<?php

namespace App\Security;

use App\Service\TokenService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class AccessTokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(private TokenService $tokenService)
    {
    }

    public function getSupportedScheme(): string
    {
        return 'Bearer';
    }

    public function getUserBadgeFrom(string $credentials): UserBadge
    {
        // Valider le token
        $user = $this->tokenService->validateToken($credentials);

        if (!$user) {
            throw new CustomUserMessageAuthenticationException('Invalid token.');
        }

        if ($user->isBlocked()) {
            throw new CustomUserMessageAuthenticationException('Ce compte a été désactivé pour non respect des règles de la communauté. Veuillez contacter un administrateur pour plus d\'informations.');
        }

        // Retourner le UserBadge avec l'identifiant de l'utilisateur (username ou email)
        // On utilise getUserIdentifier() qui retourne le username
        return new UserBadge($user->getUserIdentifier());
    }
}
