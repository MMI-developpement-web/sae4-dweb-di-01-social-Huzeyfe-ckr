<?php
//ce fichier permet de charger les users

namespace App\Security;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class AppUserProvider implements UserProviderInterface, PasswordUpgraderInterface
{
    public function __construct(private UserRepository $userRepository)
    {
    }

    /**
     * Symfony calls this method if you use features like switch_user
     * or remember_me.
     *
     * If you're not using these features, you do not need to implement
     * this method.
     *
     * @throws UserNotFoundException if the user is not found
     */
    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        $user = $this->userRepository->findOneBy(['user' => $identifier]);

        if (!$user) {
            throw new UserNotFoundException(sprintf('User with identifier "%s" does not exist.', $identifier));
        }

        return $user;
    }

    /**
     * Refreshes the user after deserialization.
     *
     * @param UserInterface $user
     * @return UserInterface
     */
    public function refreshUser(UserInterface $user): UserInterface
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Invalid user class "%s".', \get_class($user)));
        }

        // Return a User object based on the username.
        // The findOneBy call lets Doctrine make the database query based on
        // one or more of the properties.
        return $this->userRepository->findOneBy(['id' => $user->getId()]);
    }

    /**
     * Tells Symfony to use this provider for this User class.
     */
    public function supportsClass(string $class): bool
    {
        return User::class === $class || is_subclass_of($class, User::class);
    }

    /**
     * Upgrades the password for a user, typically for use when the
     * authentication system has decided to upgrade the security
     * encoding used for the password.
     *
     * Please note that implementations of PasswordUpgraderInterface
     * should never persist the upgraded password themselves, they should
     * only write it to the PasswordAuthenticatedUserInterface using the
     * user's data.
     *
     * @param PasswordAuthenticatedUserInterface $user
     * @param string $newHashedPassword
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        // This is typically used to upgrade from one hashing algorithm to another,
        // when the password hashing strategy changes. For now, we don't implement this.
    }
}
