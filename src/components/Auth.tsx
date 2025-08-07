import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

interface AuthProps {
  redirectTo?: string;
}

const Auth: React.FC<AuthProps> = ({ redirectTo = '/practice/create' }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get redirectTo from URL params, fallback to prop
  const redirectTarget = searchParams.get('redirectTo') || redirectTo;

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