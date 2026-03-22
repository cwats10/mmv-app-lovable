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
  const imgStyle = { filter: 'grayscale(8%) sepia(4%)' as const, objectPosition };

  const imgClass = 'h-full w-full min-h-0 object-cover';
  const cellClass = 'overflow-hidden min-h-0 bg-[#f0eeea]';

  if (imageUrls.length === 1) {
    return (
      <div className={`h-full w-full ${cellClass} ${className}`}>
        <img src={imageUrls[0]} alt="" className={imgClass} style={imgStyle} />
      </div>
    );
  }

  if (imageUrls.length === 2) {
    return (
      <div className={`flex h-full w-full gap-[4px] ${className}`}>
        {imageUrls.map((url, i) => (
          <div key={i} className={`flex-1 ${cellClass}`}>
            <img src={url} alt="" className={imgClass} style={imgStyle} />
          </div>
        ))}
      </div>
    );
  }

  if (imageUrls.length === 3) {
    return (
      <div className={`flex h-full w-full gap-[4px] ${className}`}>
        <div className={`flex-1 ${cellClass}`}>
          <img src={imageUrls[0]} alt="" className={imgClass} style={imgStyle} />
        </div>
        <div className="flex flex-1 flex-col gap-[4px]">
          {imageUrls.slice(1).map((url, i) => (
            <div key={i} className={`flex-1 ${cellClass}`}>
              <img src={url} alt="" className={imgClass} style={imgStyle} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (imageUrls.length === 4) {
    return (
      <div className={`grid h-full w-full grid-cols-2 grid-rows-2 gap-[4px] ${className}`}>
        {imageUrls.map((url, i) => (
          <div key={i} className={cellClass}>
            <img src={url} alt="" className={imgClass} style={imgStyle} />
          </div>
        ))}
      </div>
    );
  }

  // 5 images: top row of 3, bottom row of 2
  if (imageUrls.length === 5) {
    return (
      <div className={`flex h-full w-full flex-col gap-[4px] ${className}`}>
        <div className="flex flex-1 gap-[4px]">
          {imageUrls.slice(0, 3).map((url, i) => (
            <div key={i} className={`flex-1 ${cellClass}`}>
              <img src={url} alt="" className={imgClass} style={imgStyle} />
            </div>
          ))}
        </div>
        <div className="flex flex-1 gap-[4px]">
          {imageUrls.slice(3).map((url, i) => (
            <div key={i} className={`flex-1 ${cellClass}`}>
              <img src={url} alt="" className={imgClass} style={imgStyle} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6 images: 3×2 grid
  return (
    <div className={`grid h-full w-full grid-cols-3 grid-rows-2 gap-[4px] ${className}`}>
      {imageUrls.slice(0, 6).map((url, i) => (
        <div key={i} className={cellClass}>
          <img src={url} alt="" className={imgClass} style={imgStyle} />
        </div>
      ))}
    </div>
  );
}
