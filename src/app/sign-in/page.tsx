'use client';

import Button from '@/components/common/buttons/Button';
import SocialLoginButton from '@/components/common/buttons/SocialLoginButton';
import Input from '@/components/common/inputs/Input';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { signInSchema, SignInSchema } from './signInSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useGetUserInfoMutation, useLoginMutation } from '@/api/userApi';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/store/userSlice';
import { setCookieWithExpiry } from './setCookieWithExpiry';
import clsx from 'clsx';
import LoadingSpinner from '@/components/common/loadingSpinner/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { setTempSavedRoute } from '@/store/travelPlanSlice';
import { RootState } from '@/store/store';

const Page = () => {
  const [isChecked, setIsChecked] = useState<boolean>(false); // 자동 로그인 체크 여부
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loginUser, { isLoading: loginLoading, isSuccess: loginSuccess }] = useLoginMutation(); // isSuccess, isError
  const [getUserInfo, { isLoading: getUserInfoLoading, isSuccess: getUserInfoSuccess }] =
    useGetUserInfoMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  const tempSavedRoute = useSelector((state: RootState) => state.travelPlan.tempSavedRoute);

  useEffect(() => {
    const savedRoute = localStorage.getItem('tempSavedRoute');
    if (savedRoute) {
      const parsedRoute = JSON.parse(savedRoute);
      dispatch(setTempSavedRoute(parsedRoute));
      localStorage.removeItem('tempSavedRoute');
      localStorage.setItem('from_save_route', 'true');
    }
  }, [dispatch]);

  useEffect(() => {
    console.log('로그인화면에서 일정: ', tempSavedRoute);
  }, [tempSavedRoute]);

  const {
    register, // 연결하여 유효성 검사 진행
    handleSubmit, // 폼 제출 시 실행
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange', // 유효성 검사 진행
  });

  const handleLogin = (provider: string) => {
    switch (provider) {
      case 'kakao':
        // 서버의 카카오 로그인 엔드포인트로 이동
        window.location.href = 'https://api.doreumung.site/api/v1/social/kakao/login';
        break;
      case 'google':
        // 서버의 구글 로그인 엔드포인트로 이동
        window.location.href = 'https://api.doreumung.site/api/v1/social/google/login';
        break;
    }
  };

  const onSubmit = async (data: SignInSchema) => {
    try {
      console.log(data); // 확인용
      const result = await loginUser(JSON.stringify(data)).unwrap();
      console.log('로그인 성공', result);
      setErrorMessage(''); // 에러 초기화

      // 액세스 토큰을 쿠키에 저장
      // 쿠키 설정 및 토큰 유효기간 로컬 스토리지에 저장
      setCookieWithExpiry('access_token', result?.access_token, 30 * 60);
      setCookieWithExpiry('refresh_token', result?.refresh_token, 7 * 24 * 60 * 60);

      // 로컬 스토리지에 자동 로그인 유무, 로그인 만료 토스트 팝업 노출 여부 저장
      localStorage.setItem('auto_signin', JSON.stringify(isChecked));
      localStorage.setItem('toast_shown', 'false');
      localStorage.setItem('just_logged_in', 'true');

      if (!isChecked) {
        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 현재 시간 + 1일
        localStorage.setItem('logout_time_expiry', expiryDate.toISOString());
      }

      const userData = await getUserInfo({});
      dispatch(setUser({ user: userData.data, loginType: 'email' }));

      if (tempSavedRoute) {
        router.push('/travel-plan?step=3');
      } else {
        // 홈으로 이동 후 새로고침
        window.location.href = '/';
      }
    } catch (err) {
      console.error('로그인 실패:', err);

      const errorObj = JSON.parse(JSON.stringify(err));
      const status = errorObj?.status; // status에 접근

      switch (status) {
        case 401:
          setErrorMessage('이메일 혹은 비밀번호를 확인해주세요.');
          break;
        case 404:
          setErrorMessage('가입되지 않은 이메일입니다.');
          break;
        case 500:
          setErrorMessage('알 수 없는 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
          break;
      }
    }
  };

  // 공통 tailwind
  const errorMessageStyle = 'px-3 pb-4 text-xs text-red';

  if (loginLoading || loginSuccess || getUserInfoLoading || getUserInfoSuccess)
    return <LoadingSpinner />;

  return (
    <div
      className={clsx(
        'flex flex-col justify-center items-center w-full max-w-96 h-[calc(100vh - 64px)] pt-4 pb-20 md:h-[calc(100vh - 80px)] md:pb-24',
      )}
    >
      <div className="w-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center justify-center w-full"
        >
          <p className="py-10 text-3xl text-darkerGray">로그인</p>
          <div className="flex flex-col gap-3 w-full">
            <Input
              id="email"
              label="이메일"
              type="email"
              variant="signin"
              {...register('email')}
              className="w-full"
            />
            <Input
              id="password"
              label="비밀번호"
              type="password"
              variant="signin"
              {...register('password')}
            />
            <div className="flex gap-1.5 pb-10 px-2 text-darkGray">
              <div
                className={`w-5 h-5 rounded-md ${
                  isChecked ? 'bg-green' : 'border border-green bg-background'
                } flex items-center justify-center transition-transform duration-200 transform active:scale-125`}
                onClick={() => {
                  setIsChecked(!isChecked);
                }}
              >
                {isChecked && (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <p>자동 로그인</p>
            </div>
          </div>
          {/* 이메일 에러 우선 표시 */}
          {errors.email ? (
            <p className={errorMessageStyle}>{errors.email.message}</p>
          ) : errors.password ? (
            <p className={errorMessageStyle}>{errors.password.message}</p>
          ) : errorMessage ? (
            <p className={errorMessageStyle}>{errorMessage}</p>
          ) : null}
          <div className="flex flex-col items-center gap-10 w-full">
            <Button label="로그인" className="w-full" type="submit" disabled={loginLoading} />
            <div className="flex justify-center gap-2 pb-10 text-lightGray">
              <p>아직 회원이 아니신가요?</p>
              <Link href="/sign-up">
                <p className="text-darkerGray underline underline-offset-4">회원가입</p>
              </Link>
            </div>
          </div>
        </form>
        <div className="flex flex-col items-center gap-4">
          <SocialLoginButton
            provider="kakao"
            onClick={() => {
              handleLogin('kakao');
            }}
          />
          <SocialLoginButton
            provider="google"
            onClick={() => {
              handleLogin('google');
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
