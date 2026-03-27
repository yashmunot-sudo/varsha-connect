import React from 'react';

interface BilingualTextProps {
  hindi: string;
  english: string;
  className?: string;
  textColor?: string;
}

export function BilingualText({ hindi, english, className = "", textColor = "text-current" }: BilingualTextProps) {
  return (
    <div className={`flex flex-col items-center justify-center leading-tight ${className}`}>
      <span className={`font-bold ${textColor}`}>{hindi}</span>
      <span className={`font-bold ${textColor}`}>{english}</span>
    </div>
  );
}
