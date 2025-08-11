import type React from 'react';

type Parameters = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  active: boolean;
  children: React.ReactNode;
};
const ButtonToggle: React.FC<Parameters> = ({ onClick, active, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded ${active ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
  >
    {children}
  </button>
);
export default ButtonToggle;
