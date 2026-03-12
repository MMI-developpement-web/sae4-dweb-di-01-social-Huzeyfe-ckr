<?php

namespace App\EventListener;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class CorsListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 100],
            KernelEvents::RESPONSE => ['onKernelResponse', -10],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        // Only handle API preflight requests
        if ('OPTIONS' === $request->getMethod() && 0 === strpos($request->getPathInfo(), '/api')) {
            $response = new Response('', Response::HTTP_NO_CONTENT);
            $this->addCorsHeaders($response);
            $event->setResponse($response);
        }
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        $request = $event->getRequest();
        if (0 === strpos($request->getPathInfo(), '/api')) {
            $response = $event->getResponse();
            $this->addCorsHeaders($response);
        }
    }

    private function addCorsHeaders(Response $response): void
    {
        // Adjust origin as needed in production (don't use '*')
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        // Cache preflight for 1 hour
        $response->headers->set('Access-Control-Max-Age', '3600');
    }
}
