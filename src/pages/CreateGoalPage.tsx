import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavings } from '../context/SavingsContext';

export const CreateGoalPage: React.FC = () => {
  const navigate = useNavigate();
  const { openCreateGoal } = useSavings();

  useEffect(() => {
    openCreateGoal();
    navigate('/dashboard', { replace: true });
  }, [openCreateGoal, navigate]);

  return null;
};
