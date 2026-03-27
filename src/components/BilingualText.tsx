import React from 'react';

interface BilingualTextProps { hindi: string; english: string; className?: string; textColor?: string; size?: 'xs' | 'sm' | 'base' | 'lg'; }

export function BilingualText({ hindi, english, className = '', textColor = 'text-current', size = 'sm' }: BilingualTextProps) {

  const sizeClass = { xs: 'text-[10px]', sm: 'text-xs', base: 'text-sm', lg: 'text-base' }[size];

  return (

    <div className={'flex flex-col items-center justify-center leading-tight ' + className}>

      <span className={'font-bold ' + textColor + ' ' + sizeClass}>{hindi}</span>

      <span className={'font-bold ' + textColor + ' ' + sizeClass}>{english}</span>

    </div>

  );

}

export default BilingualText;
