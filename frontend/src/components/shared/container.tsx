import React, { PropsWithChildren, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';

interface Props {
   className?: string;
}

export const Container: React.FC<PropsWithChildren<Props>> = ({ className, children }) => {
   return (
      <div className={cn('mx-auto max-w-[1200px] px-6 xl:px-0', className)}>{children}</div>
   );
};