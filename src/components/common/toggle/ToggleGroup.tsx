import React, { useEffect, useState } from 'react';
import { toggleStyles } from './toggleStyles';
import { THEMES } from './constants';
import { ToggleGroupProps } from './types';
import { twMerge } from 'tailwind-merge';

// 일정 생성 시, 테마 및 식사 여부를 선택하기 위한 ToggleGroup
// 배열에 담긴 다수의 선택지를 items로 통해 전달받아 여러 Toggle 버튼 렌더링
// onChange는 ToggleGroup을 호출한 컴포넌트 내에서 정의된 함수로, 토글에 의해 선택된 아이템들의 인덱스를 담은 배열을 전달
const ToggleGroup: React.FC<ToggleGroupProps> = ({
  color,
  items = THEMES,
  onChange,
  className,
  activeToggles = [],
}) => {
  const [activeIndices, setActiveIndices] = useState<number[]>(activeToggles);

  useEffect(() => {
    setActiveIndices(activeToggles);
  }, [activeToggles]);

  const handleToggle = (index: number) => {
    const updatedIndices = activeIndices.includes(index)
      ? activeIndices.filter(i => i !== index)
      : [...activeIndices, index];

    setActiveIndices(updatedIndices);
    onChange(updatedIndices);
  };

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-3 w-full md:justify-start md:gap-4 md:w-auto">
      {items.map((item, index) => (
        <button
          key={`${index}-${item}`}
          className={twMerge(
            toggleStyles({
              size: 'md',
              color,
              checked: activeIndices.includes(index),
            }),
            className,
          )}
          onClick={() => handleToggle(index)}
        >
          {item}
        </button>
      ))}
    </div>
  );
};

export default ToggleGroup;
