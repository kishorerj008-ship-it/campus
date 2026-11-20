import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface EventCoverImageProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
}

export function EventCoverImage({
  src,
  alt,
  title,
  className = '',
}: EventCoverImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`w-full h-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 flex flex-col items-center justify-center p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Calendar className="w-8 h-8 text-slate-400 mb-2" aria-hidden="true" />
        <p className="text-xs font-medium text-slate-600 line-clamp-2 max-w-[220px]">
          {title}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}
