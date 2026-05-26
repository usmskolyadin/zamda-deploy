'use client';

import Image from 'next/image';

type Props = {
  size?: number;
  full?: boolean;
  message?: string;
};

export default function LoadingSpinner({ size = 48, full = false, message }: Props) {
  const spinner = (
    <div style={{ width: size, height: size }} className="flex items-center justify-center">
      <div className="animate-spin" style={{ animationDuration: '1.6s' }}>
        <Image src="/zamda-white.png" alt="Zamda" width={Math.max(24, size)} height={Math.max(24, size)} />
      </div>
    </div>
  );

  if (full) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 text-center shadow-2xl">
          <div className="flex items-center justify-center">{spinner}</div>
        </div>
      </div>
    );
  }

  return <>{spinner}</>;
}
