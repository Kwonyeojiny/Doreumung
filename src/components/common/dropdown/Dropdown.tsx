import React from 'react';
import { DropdownOption, DropdownProps } from './types';
import { DROPDOWN_MENU } from './constants';
import { useRouter } from 'next/navigation';
import { dropdownStyles } from './dropdownStyles';
import useIsMobile from '@/hooks/useIsMobile';
import { clearUser } from '@/store/userSlice';
import { destroyCookie, parseCookies } from 'nookies';
import { useLogoutMutation } from '@/api/userApi';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setNavigationPath, showPopup } from '@/store/navigationSlice';
import { RootState } from '@/store/store';

const Dropdown: React.FC<DropdownProps> = ({
  variant,
  setIsOpen,
  travel_route_id,
  review_id,
  onDeleteConfirm,
}) => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const options: DropdownOption[] = DROPDOWN_MENU[variant];
  const { isNavigationConfirmationRequired } = useAppSelector(
    (state: RootState) => state.navigation,
  );
  const dispatch = useAppDispatch();
  const [logoutUser] = useLogoutMutation();

  const handleSelect = (option: DropdownOption) => {
    if (option.action) {
      switch (option.action) {
        case 'signOut':
          // 로그아웃 로직 구현
          localStorage.setItem('toast_shown', 'true');

          localStorage.removeItem('persist:user');
          localStorage.removeItem('auto_signin');
          localStorage.removeItem('access_token_expiry');
          localStorage.removeItem('logout_time_expiry');
          localStorage.removeItem('refresh_token_expiry');

          dispatch(clearUser());

          logoutUser(
            JSON.stringify({
              access_token: parseCookies().access_token,
              refresh_token: parseCookies().refresh_token,
            }),
          )
            .unwrap()
            .then(res => console.log(res))
            .catch(err => console.log('로그아웃 실패', err));

          destroyCookie(null, 'access_token', { path: '/' });
          destroyCookie(null, 'refresh_token', { path: '/' });

          router.push('/'); // 메인으로 이동
          break;
        case 'deleteTravel':
          // 저장 경로 삭제 로직 구현
          if (onDeleteConfirm) {
            onDeleteConfirm();
          }
          break;
        case 'createReview':
          router.push(`${option.path}/${travel_route_id}`);
          break;
        case 'seeDetails':
          router.push(`${option.path}/${travel_route_id}`);
          break;
        case 'seeMyReview':
          router.push(`${option.path}/${review_id}`);
          break;
        default:
          throw new Error(`Unknown action type: ${option.action}`);
      }
    } else if (option.path) {
      if (isNavigationConfirmationRequired) {
        dispatch(setNavigationPath(option.path));
        dispatch(showPopup());
      } else {
        router.push(option.path);
      }
    }

    setIsOpen(false);
  };

  return (
    <div className={dropdownStyles({ variant: isMobile ? 'mobile' : 'default' })}>
      {options.map((option, index) => (
        <div
          key={`${index}-${option.label}`}
          className={clsx(
            !review_id && option.label === '작성한 후기' && 'hidden',
            review_id && option.label === '후기 작성' && 'hidden',
          )}
        >
          <button
            className="w-full h-9 px-4 py-2 text-base text-darkerGray text-start cursor-pointer hover:bg-fadedOrange"
            onClick={() => handleSelect(option)}
          >
            {option.label}
          </button>
          {isMobile && option.separator && <hr className="border-px border-darkGray" />}
        </div>
      ))}
    </div>
  );
};

export default Dropdown;
