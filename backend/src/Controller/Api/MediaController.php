<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\File\UploadedFile;

#[Route('/api', name: 'api_')]
class MediaController extends AbstractController
{
    #[Route('/media/upload', name: 'media_upload', methods: ['POST'])]
    public function upload(Request $request): Response
    {
        try {
            // Récupère le fichier uploadé depuis la requête
            $uploadedFile = $request->files->get('file');

            if (!$uploadedFile instanceof UploadedFile) {
                return $this->json(['error' => 'Aucun fichier fourni'], Response::HTTP_BAD_REQUEST);
            }

            // Vérifie le type MIME (image et vidéo)
            $mimeType = $uploadedFile->getMimeType();
            $allowedMimes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'video/mp4',
                'video/mpeg',
                'video/quicktime',
                'video/x-msvideo',
                'video/webm'
            ];

            if (!in_array($mimeType, $allowedMimes, true)) {
                return $this->json(['error' => 'Type de fichier non autorité. Autorités: images et vidéos'], Response::HTTP_BAD_REQUEST);
            }

            // Vérifie la taille (max 50MB)
            $maxSize = 50 * 1024 * 1024; // 50MB
            if ($uploadedFile->getSize() > $maxSize) {
                return $this->json(['error' => 'Fichier trop volumineux (max 50MB)'], Response::HTTP_BAD_REQUEST);
            }

            // Crée un nom de fichier unique
            $originalFilename = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = transliterator_transliterate(
                'Any-Latin; Latin-ASCII; [^A-Za-z0-9_] remove; Lower()',
                $originalFilename
            );
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $uploadedFile->guessExtension();

            // Utilise Symfony's public directory
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/media';
            
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            // Déplace le fichier
            $uploadedFile->move($uploadDir, $newFilename);

            // Retourne l'URL du fichier uploadé
            $mediaUrl = '/uploads/media/' . $newFilename;

            return $this->json(['mediaUrl' => $mediaUrl], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'Erreur lors du téléchargement du fichier: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
