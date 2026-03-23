<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;

#[Route('/admin')]
class AdminController extends AbstractController
{
    /**
     * Admin login page
     */
    #[Route('/login', name: 'admin_login', methods: ['GET', 'POST'])]
    public function login(): Response
    {
        return $this->render('admin/login.html.twig');
    }

    /**
     * Admin dashboard (protected by Symfony security)
     */
    #[Route('', name: 'admin_dashboard', methods: ['GET'])]
    public function dashboard(#[CurrentUser] ?User $user): Response
    {
        if (!$user || !in_array('ROLE_ADMIN', $user->getRoles())) {
            return $this->redirectToRoute('admin_login');
        }

        return $this->render('admin/dashboard.html.twig', [
            'admin' => $user
        ]);
    }

    /**
     * Admin logout
     */
    #[Route('/logout', name: 'admin_logout')]
    public function logout(): void
    {
        // This will be handled by symfony security logout
    }
}
