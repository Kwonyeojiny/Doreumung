'use client';

import React, { useEffect, useState } from 'react';
import { LayerPopupProps } from './types';
import { layerPopupStyles } from './layerPopupStyles';
import Button from '../buttons/Button';
import Image from 'next/image';
import Input from '../inputs/Input';
import Dolmung from '@public/images/dolmung.svg';

const LayerPopup: React.FC<LayerPopupProps> = ({
  label,
  type = 'confirm',
  onConfirm,
  setShowLayerPopup,
  ...props
}) => {
  const isConfirmPopup = type === 'confirm'; // 입력창 없는 팝업
  const [titleData, setTitleData] = useState<string>(''); // 제목 지정

  const handleConfirm = () => {
    if (isConfirmPopup) {
      onConfirm();
    } else {
      onConfirm(titleData); // 부모 컴포넌트에 데이터 전달
    }
    setShowLayerPopup(false); // 팝업 닫기
  };

  const handleCancel = () => {
    setShowLayerPopup(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLayerPopup(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setShowLayerPopup]);

  // 공통 Tailwind 클래스
  const containerBaseStyles = 'relative w-full p-6';
  const buttonContainerStyles = 'flex justify-end gap-2 md:gap-3';
  const textContainerStyles = 'flex items-center text-sm md:text-base';

  return (
    <div className="flex justify-center items-center fixed inset-0 bg-overlay z-50">
      <div className={layerPopupStyles()} {...props}>
        <div className={`${containerBaseStyles} ${isConfirmPopup ? 'h-50' : 'h-62'}`}>
          {isConfirmPopup ? (
            <div className="flex flex-col gap-10 md:gap-20">
              <div className={`${textContainerStyles} gap-2 md:gap-5`}>
                <Image src={Dolmung} alt="dolmung image" className="w-[45px] md:w-[60px] h-auto" />
                {label}
              </div>
              <div className={buttonContainerStyles}>
                <Button label="취소" size="xs" color="lighterGray" onClick={handleCancel} />
                <Button label="확인" size="xs" onClick={handleConfirm} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 md:gap-5">
              <div className={`${textContainerStyles} gap-3 pb-3 md:pl-6`}>
                <Image src={Dolmung} alt="dolmung image" className="w-[45px] md:w-[50px] h-auto" />
                {label}
              </div>
              <Input
                id="title"
                type="text"
                variant="title"
                className="w-72 md:w-96 self-center"
                placeholder="2024-12-31"
                value={titleData}
                onChange={event => setTitleData(event.target.value)}
              />
              <div className={`${buttonContainerStyles} pt-5`}>
                <Button label="취소" size="xs" color="lighterGray" onClick={handleCancel} />
                <Button label="확인" size="xs" onClick={handleConfirm} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayerPopup;
