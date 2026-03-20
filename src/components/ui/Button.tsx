import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', ...props }) => {
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100',
    danger: 'bg-red-700 hover:bg-red-600 text-white',
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5 rounded',
    md: 'text-sm px-4 py-2 rounded-md',
  };

  return (
    <button
      className={`${variantClasses[variant]} ${sizeClasses[size]} font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    />
  );
};

export default Button;