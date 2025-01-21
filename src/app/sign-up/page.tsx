'use client';

import Button from '@/components/common/buttons/Button';
import Input from '@/components/common/inputs/Input';
import Select from '@/components/common/select/Select';
import { SignUpSchema, signUpSchema } from './signUpSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useSignUpMutation } from '@/api/userApi';
import { omit } from 'lodash';
import { toast } from '@/components/common/toast/Toast';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/common/loadingSpinner/LoadingSpinner';

const Page = () => {
  const genderOptions: string[] = ['여성', '남성', '선택안함'];
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // Select 컴포넌트에서 생년월일 데이터 받아오기
  const [selectedGender, setSelectedGender] = useState<string | null>('선택안함'); // 선택된 성별
  const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedGender(event.target.value); // 선택된 값 업데이트
  };
  const [signUpUser, { isLoading, isSuccess }] = useSignUpMutation();
  const router = useRouter();

  const {
    register, // 연결하여 유효성 검사 진행
    handleSubmit, // 폼 제출 시 실행
    formState: { errors },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange', // 유효성 검사 진행
  });

  const onSubmit = async (data: SignUpSchema) => {
    try {
      // 필수 항목 + 선택 항목 데이터 합치기
      const userData = {
        ...omit(data, 'confirmPassword'), // confirmPassword 제거
        birthday: selectedDate || '1925-01-01',
        ...(selectedGender !== '선택안함'
          ? { gender: selectedGender === '여성' ? 'female' : 'male' }
          : {}),
      };

      // API 호출
      const result = await signUpUser(JSON.stringify(userData)).unwrap();
      console.log('회원가입 성공:', result);
      toast({
        message: ['회원가입이 완료되었습니다.', '로그인 페이지로 이동합니다.'],
      });

      setTimeout(() => {
        router.push('/sign-in');
      }, 2000); // 로그인 페이지로 이동ㅎㅎ
    } catch (err) {
      console.error('회원가입 실패:', err);
      toast({
        message: ['회원가입에 실패하였습니다.', '잠시 후 다시 시도해 주세요.'],
        type: 'error',
      });
    }
  };

  // 공통 tailwind
  const errorMessageStyle = 'px-3 pb-3 text-xs text-red';

  if (isLoading || isSuccess) return <LoadingSpinner />;

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-96 h-[calc(100vh - 64px)] pt-4 pb-20 md:h-[calc(100vh - 80px)] md:pb-24">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="w-full">
          <p className="py-10 text-3xl text-darkerGray text-center">회원가입</p>
          <div className="flex flex-col gap-1">
            <Input
              id="email"
              label="이메일"
              {...register('email')}
              type="email"
              variant="default"
            />
            {errors.email && <p className={errorMessageStyle}>{errors.email.message}</p>}

            <Input
              id="text"
              label="닉네임"
              {...register('nickname')}
              type="text"
              variant="default"
            />
            {errors.nickname && <p className={errorMessageStyle}>{errors.nickname.message}</p>}

            <Input
              id="password"
              label="비밀번호"
              {...register('password')}
              type="password"
              variant="default"
            />
            {errors.password && <p className={errorMessageStyle}>{errors.password.message}</p>}

            <Input
              id="confirmPassword"
              label="비밀번호 확인"
              {...register('confirmPassword')}
              type="password"
              variant="default"
            />
            {errors.confirmPassword && (
              <p className={errorMessageStyle}>{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-center pt-5 py-5 px-3 text-darkGray">
            <p className="pr-2">선택 항목</p>
            <div className="flex-grow h-px bg-lighterGray"></div>
          </div>

          <div className="flex flex-col gap-4">
            <Select setSelectedDate={setSelectedDate} optional={true} />

            <div>
              <p className="px-5 pb-2 text-sm text-logo">성별</p>
              <div className="flex gap-7 px-3">
                {genderOptions.map(genderOption => {
                  return (
                    <label
                      key={genderOption}
                      className="flex items-center space-x-2 pb-5 accent-darkGray"
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={genderOption}
                        checked={selectedGender === genderOption}
                        className="w-3"
                        onChange={handleGenderChange}
                      />
                      <span className="h-4 text-sm text-darkGray align-middle">{genderOption}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <Button label="가입하기" onClick={() => {}} className="w-full" disabled={isLoading} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default Page;
