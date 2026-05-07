'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const chars = '!<>-_\\/[]{}—=+*^?#________';

export default function ScrambleText({ text, speed = 40, delay = 0 }) {
  const [displayText, setDisplayText] = useState(text.split('').map(() => ''));
  const iteration = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const startScramble = () => {
      iteration.current = 0;
      
      const scramble = () => {
        const nextText = text.split('').map((char, index) => {
          if (index < Math.floor(iteration.current)) {
            return text[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        });

        setDisplayText(nextText);

        if (iteration.current < text.length) {
          iteration.current += 0.35;
          timeoutRef.current = setTimeout(scramble, speed);
        } else {
          setDisplayText(text.split(''));
        }
      };

      scramble();
    };

    const timer = setTimeout(startScramble, delay);
    return () => {
      clearTimeout(timer);
      clearTimeout(timeoutRef.current);
    };
  }, [text, speed, delay]);

  return (
    <span style={{ 
      display: 'inline-flex', 
      flexWrap: 'wrap',
      fontFamily: 'var(--font-mono)',
      letterSpacing: '-0.05em'
    }}>
      {displayText.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ 
            display: 'inline-block', 
            width: '1ch', 
            textAlign: 'center'
          }}
        >
          {char || '\u00A0'}
        </motion.span>
      ))}
    </span>
  );
}
