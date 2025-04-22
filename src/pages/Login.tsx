import React from 'react';
import LoginForm from '../components/forms/LoginForm';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-black rounded-[24px] p-8 shadow-xl">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;