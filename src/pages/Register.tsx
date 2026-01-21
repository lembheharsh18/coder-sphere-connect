
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';
import '@/styles/login.css';

const Register = () => {
  const location = useLocation();
  const formData = location.state?.formData;

  return (
    <div className="min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="mb-8 flex items-center justify-center">
          <Link to="/" className="text-4xl font-bold text-[#5ee7ff] animate-pulse">
            CoderSphere
          </Link>
        </div>
        <RegisterForm initialData={formData} />
      </div>
    </div>
  );
};

export default Register;
