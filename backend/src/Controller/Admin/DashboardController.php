<?php

namespace App\Controller\Admin;

use App\Entity\Post; // Importe l'entité Post
use App\Entity\User; // Importe l'entité User
use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminDashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use App\Controller\Admin\PostCrudController;
use App\Controller\Admin\UserCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use Symfony\Component\HttpFoundation\Response;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;

#[AdminDashboard(routePath: '/admin', routeName: 'admin')]
class DashboardController extends AbstractDashboardController
{
    public function index(): Response
    {
        $adminUrlGenerator = $this->container->get(AdminUrlGenerator::class);
        $url = $adminUrlGenerator->setController(PostCrudController::class)->generateUrl();
        return $this->redirect($url);
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('Mon Administration');
    }

    public function configureMenuItems(): iterable
    {
        // Le menu principal
        yield MenuItem::linkToDashboard('Accueil', 'fa fa-home');

        // Ajout des liens vers les sections de gestion
        yield MenuItem::section('Gestion du contenu');
        yield MenuItem::linkTo(PostCrudController::class, 'Articles (Posts)', 'fas fa-newspaper');

        yield MenuItem::section('Utilisateurs');
        yield MenuItem::linkTo(UserCrudController::class, 'Comptes Utilisateurs', 'fas fa-users');
    }
}