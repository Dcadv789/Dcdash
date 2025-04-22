import React from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Relatorios from '../pages/Relatorios';
import Indicadores from '../pages/Indicadores';
import Empresas from '../pages/Empresas';
import Usuarios from '../pages/Usuarios';
import Permissoes from '../pages/Permissoes';
import Perfil from '../pages/Perfil';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <MainLayout><Dashboard /></MainLayout>,
  },
  {
    path: '/dashboard',
    element: <MainLayout><Dashboard /></MainLayout>,
  },
  {
    path: '/relatorios',
    element: <MainLayout><Relatorios /></MainLayout>,
  },
  {
    path: '/indicadores',
    element: <MainLayout><Indicadores /></MainLayout>,
  },
  {
    path: '/empresas',
    element: <MainLayout><Empresas /></MainLayout>,
  },
  {
    path: '/usuarios',
    element: <MainLayout><Usuarios /></MainLayout>,
  },
  {
    path: '/permissoes',
    element: <MainLayout><Permissoes /></MainLayout>,
  },
  {
    path: '/perfil',
    element: <MainLayout><Perfil /></MainLayout>,
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;