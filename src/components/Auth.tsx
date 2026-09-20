import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';
import { useAuth } from '../contexts/AuthContext';

interface AuthProps {
  redirectTo?: string;
}

const Auth: React.FC<AuthProps> = ({ redirectTo = '/practice/create' }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  
  // Get redirectTo from URL params, fallback to prop
  const redirectTarget = searchParams.get('redirectTo') || redirectTo;

  useEffect(() => {
    if (!loading && user && !user.isAnonymous) {
      navigate(redirectTarget, { replace: true });
    }
  }, [loading, user, navigate, redirectTarget]);

  const handleSuccess = () => {
    navigate(redirectTarget);
  };

  const handleSwitchToSignUp = () => {
    setIsSignUp(true);
  };

  const handleSwitchToSignIn = () => {
    setIsSignUp(false);
  };

  return (
    <div>
      {isSignUp ? (
        <SignUp 
          onSuccess={handleSuccess}
          onSwitchToSignIn={handleSwitchToSignIn}
        />
      ) : (
        <SignIn 
          onSuccess={handleSuccess}
          onSwitchToSignUp={handleSwitchToSignUp}
        />
      )}
    </div>
  );
};

export { Auth };
