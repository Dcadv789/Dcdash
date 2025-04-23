import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import MainLayout from '../layout/MainLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Relatorios from '../pages/Relatorios';
import Indicadores from '../pages/Indicadores';
import Empresas from '../pages/Empresas';
import Usuarios from '../pages/Usuarios';
import Permissoes from '../pages/Permissoes';
import Perfil from '../pages/Perfil';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/relatorios"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Relatorios />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/indicadores"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Indicadores />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresas"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Empresas />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Usuarios />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/permissoes"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Permissoes />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Perfil />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;