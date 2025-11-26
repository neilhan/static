import { memo } from 'react';
import soundOnSvg from '../../assets/icons/sound-on.svg?raw';
import soundOffSvg from '../../assets/icons/sound-off.svg?raw';

type SoundIconProps = {
  muted?: boolean;
  className?: string;
  title?: string;
};

const baseClass = 'icon-sound';

export const SoundIcon = memo(({ muted = false, className = '', title }: SoundIconProps) => {
  const classes = className ? `${baseClass} ${className}` : baseClass;
  const svgMarkup = muted ? soundOffSvg : soundOnSvg;

  return (
    <span
      className={classes}
      role="img"
      aria-label={title}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
});

SoundIcon.displayName = 'SoundIcon';

