interface Props {
  imageUrls: string[];
  className?: string;
  imagePosition?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

/**
 * Masonry-style image gallery that shows ALL uploaded images.
 * Uses object-contain so images are never cropped.
 * Layout adapts based on image count:
 *  1 → full width
 *  2 → side by side
 *  3 → one large left, two stacked right
 *  4 → 2×2 grid
 *  5 → top row of 3, bottom row of 2
 *  6 → 3×2 grid
 */
export function ImageGallery({ imageUrls, className = '', imagePosition = 'center' }: Props) {
  if (imageUrls.length === 0) return null;

  const objectPosition = imagePosition === 'center' ? 'center' : imagePosition;
  const foregroundStyle = { filter: 'grayscale(8%) sepia(4%)' as const, objectPosition };
  const backgroundStyle = { objectPosition };

  const renderImageCell = (url: string, key: number | string, extraClassName = '') => (
    <div key={key} className={`relative min-h-0 overflow-hidden bg-white ${extraClassName}`}>
      <div className="relative flex h-full w-full min-h-0 items-center justify-center p-1">
        <img
          src={url}
          alt=""
          className="h-full w-full min-h-0 object-contain"
          style={foregroundStyle}
        />
      </div>
    </div>
  );

  if (imageUrls.length === 1) {
    return (
      <div className={`h-full w-full ${className}`}>
        {renderImageCell(imageUrls[0], 0, 'h-full w-full')}
      </div>
    );
  }

  if (imageUrls.length === 2) {
    return (
      <div className={`flex h-full w-full gap-[4px] ${className}`}>
        {imageUrls.map((url, i) => renderImageCell(url, i, 'flex-1'))}
      </div>
    );
  }

  if (imageUrls.length === 3) {
    return (
      <div className={`flex h-full w-full gap-[4px] ${className}`}>
        {renderImageCell(imageUrls[0], 0, 'flex-1')}
        <div className="flex min-h-0 flex-1 flex-col gap-[4px]">
          {imageUrls.slice(1).map((url, i) => renderImageCell(url, i + 1, 'flex-1'))}
        </div>
      </div>
    );
  }

  if (imageUrls.length === 4) {
    return (
      <div className={`grid h-full w-full grid-cols-2 grid-rows-2 gap-[4px] ${className}`}>
        {imageUrls.map((url, i) => renderImageCell(url, i))}
      </div>
    );
  }

  if (imageUrls.length === 5) {
    return (
      <div className={`flex h-full w-full flex-col gap-[4px] ${className}`}>
        <div className="flex min-h-0 flex-1 gap-[4px]">
          {imageUrls.slice(0, 3).map((url, i) => renderImageCell(url, i, 'flex-1'))}
        </div>
        <div className="flex min-h-0 flex-1 gap-[4px]">
          {imageUrls.slice(3).map((url, i) => renderImageCell(url, i + 3, 'flex-1'))}
        </div>
      </div>
    );
  }

  return (
    <div className={`grid h-full w-full grid-cols-3 grid-rows-2 gap-[4px] ${className}`}>
      {imageUrls.slice(0, 6).map((url, i) => renderImageCell(url, i))}
    </div>
  );
}
