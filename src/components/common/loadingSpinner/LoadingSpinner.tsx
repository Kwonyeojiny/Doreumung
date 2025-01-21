'use client';

import Dolmung from '@public/images/dolmung.svg';
import { motion } from 'motion/react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

const LoadingSpinner = ({ className }: { className?: string }) => {
  return (
    <div
      className={twMerge(
        'flex justify-center items-center w-full h-[calc(100vh - 64px)] md:h-[calc(100vh - 80px)]',
        className,
      )}
    >
      <motion.div
        className="w-12"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <Image src={Dolmung} alt="loading" />
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
