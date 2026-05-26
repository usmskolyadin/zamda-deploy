'use client';

import LoadingSpinner from './LoadingSpinner';

type Props = {
  message?: string;
};

export default function LoadingScreen({ message }: Props) {
  return (
    <div className="w-full h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size={72} />
      </div>
    </div>
  );
}
