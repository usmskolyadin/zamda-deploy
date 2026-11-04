interface AdThumbnailProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

export default function AdThumbnail({ src, alt = "", className = "" }: AdThumbnailProps) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 text-gray-500 font-medium ${className}`}>
        No photo
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} />;
}
