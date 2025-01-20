import React, { useState, useRef, useEffect } from 'react';
import { Text, Tooltip } from '@chakra-ui/react';

interface MaxTextTooltipProps {
  children: string; // Enforce string type for text content
  maxWidth?: number; // Optional prop for max width
}

const MaxTextTooltip: React.FC<MaxTextTooltipProps> = ({ children, maxWidth = 200, ...props }) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        setIsOverflowing(textRef.current.scrollWidth > maxWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => window.removeEventListener('resize', checkOverflow);
  }, [maxWidth]);

  const displayedText = isOverflowing ? `${children.slice(0, maxWidth - 3)}...` : children;

  return (
    <Tooltip label={children} hasArrow placement="top">
      <Text ref={textRef} maxW={maxWidth} overflow={'hidden'} {...props}>
        <Text style={{wordWrap: 'normal'}}>{displayedText}</Text>
      </Text>
    </Tooltip>
  );
};

export default MaxTextTooltip;
