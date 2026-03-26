import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./routes/root";
import Home from "./routes/home";
import FirstScreen from "./routes/firstscreen";
import Login from "./routes/login";
import Signup from "./routes/signup";
import Post from "./routes/post";
import Profile from "./routes/profile";
import UserProfile from "./components/UserProfile";

import "./index.css";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root />,
      children: [
        { index: true, element: <FirstScreen /> },
        { path: "firstscreen", element: <FirstScreen /> },
        { path: "home", element: <Home /> },
        { path: "profile", element: <Profile /> },
        { path: "profile/:id", element: <UserProfile /> },
        { path: "post", element: <Post /> },
        { path: "login", element: <Login /> },
        { path: "signup", element: <Signup /> },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL, // ⭐ ESSENTIEL POUR LE SERVEUR MMI
    
  }
);

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
