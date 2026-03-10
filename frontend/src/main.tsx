import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./routes/root";
import Home from "./routes/home"; // /home -> fil d'actualité (Feed)
import FirstScreen from "./routes/firstscreen"; // renamed from previous Home
import Login from "./routes/login";
import Signup from "./routes/signup";
import Post from "./routes/post";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "firstscreen",
        element: <FirstScreen />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "post",
        element: <Post />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
    ],
  },
]);

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
