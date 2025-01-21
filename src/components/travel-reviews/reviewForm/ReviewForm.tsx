import Input from '@/components/common/inputs/Input';
import {
  EDIT_REVIEW_ERROR_MESSAGE,
  EDIT_REVIEW_SUCCESS_MESSAGE,
  INFO_CONTAINER_STYLES,
  LABEL_STYLES,
  POST_REVIEW_ERROR_MESSAGE,
  POST_REVIEW_SUCCESS_MESSAGE,
} from '../constants';
import { useState } from 'react';
import StarRating from '@/components/travel-reviews/reviewForm/StarRatings';
import RouteInfoContainer from '@/components/travel-reviews/RouteInfoContainer';
import LayerPopup from '@/components/common/layerPopup/LayerPopup';
import Button from '@/components/common/buttons/Button';
import { useParams, useRouter } from 'next/navigation';
import Tiptap from '@/components/travel-reviews/textEditor/Tiptap';
import Toolbar from '@/components/travel-reviews/textEditor/Toolbar';
import useTiptap from '@/hooks/useTiptap';
import {
  EditReviewRequestType,
  PostReviewRequestType,
  ReviewFormType,
} from '@/app/travel-reviews/types';
import { reviewFormSchema } from '@/app/travel-reviews/schemas';
import { ReviewFormProps } from '../types';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ErrorMessage from '@/components/common/errorMessage/ErrorMessage';
import ThumbnailPicker from './ThumbnailPicker';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { useEditReviewMutation, usePostReviewMutation } from '@/api/reviewApi';
import { toast } from '@/components/common/toast/Toast';
import LoadingSpinner from '@/components/common/loadingSpinner/LoadingSpinner';
import BackNavigation from '@/components/common/backNavigation/BackNavigation';
import useNavigationPopup from '@/hooks/useNavigationPopup';

const ReviewForm = ({
  mode = 'create',
  defaultValues = { title: '', rating: 0, content: '', thumbnail: '' },
  travelRouteInfo,
}: ReviewFormProps) => {
  const router = useRouter();
  const { routeId, reviewId } = useParams();

  const user = useAppSelector((state: RootState) => state.user.user);
  const uploaded_urls = useAppSelector((state: RootState) => state.reviewImages.currentImages);
  const deleted_urls = useAppSelector((state: RootState) => state.reviewImages.deletedImages);

  const [postReview, { isLoading: postLoading, isSuccess: postSuccess }] = usePostReviewMutation();
  const [editReview, { isLoading: editLoading, isSuccess: editSuccess }] = useEditReviewMutation();

  const { showNavigationPopup, handleNavigation, handleNavigationConfirm, handleNavigationCancel } =
    useNavigationPopup();

  const [title, setTitle] = useState<string>(defaultValues.title);
  const [rating, setRating] = useState<number>(defaultValues.rating);
  const [content, setContent] = useState<string>(defaultValues.content);
  const [thumbnail, setThumbnail] = useState<string | null>(defaultValues.thumbnail);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLayerPopup, setShowLayerPopup] = useState<boolean>(false);
  const { editor } = useTiptap(content);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ReviewFormType>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { title, rating, content },
  });

  const onSubmit: SubmitHandler<ReviewFormType> = data => {
    setTitle(data.title);
    setRating(data.rating);
    setContent(editor!.getHTML());

    setShowLayerPopup(true);
  };

  const sendReviewRequest = () => {
    if (user) {
      setIsLoading(true);
      if (mode === 'create') {
        const newReview: PostReviewRequestType = {
          body: { travel_route_id: Number(routeId), title, content, rating, thumbnail },
          uploaded_urls,
          deleted_urls,
        };

        postReview(newReview)
          .unwrap()
          .then(res => {
            console.log(res);
            toast(POST_REVIEW_SUCCESS_MESSAGE);
            router.push(`/travel-reviews/detail/${res.review_id}`);
          })
          .catch(() => {
            setIsLoading(false);
            toast(POST_REVIEW_ERROR_MESSAGE);
          });
      } else {
        const editedReview: EditReviewRequestType = {
          review_id: Number(reviewId),
          body: {
            title,
            content,
            rating,
            thumbnail,
          },
          deleted_urls,
          uploaded_urls,
        };

        editReview(editedReview)
          .unwrap()
          .then(res => {
            toast(EDIT_REVIEW_SUCCESS_MESSAGE);
            router.push(`/travel-reviews/detail/${res.review_id}`);
          })
          .catch(() => {
            setIsLoading(false);
            toast(EDIT_REVIEW_ERROR_MESSAGE);
          });
      }
    }
  };

  if (postLoading || editLoading || postSuccess || editSuccess) return <LoadingSpinner />;

  return (
    <div className="flex flex-col items-center w-full">
      <BackNavigation
        to={mode === 'create' ? 'reviewList' : 'review'}
        reviewId={mode === 'edit' && reviewId ? Number(reviewId) : undefined}
        onNavigate={handleNavigation}
      />
      <h3 className="block py-12 text-3xl">후기 {mode === 'create' ? '작성' : '수정'}</h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 w-full md:gap-4"
        noValidate
      >
        <div className={INFO_CONTAINER_STYLES}>
          <span className={LABEL_STYLES}>제목</span>
          <div className="flex flex-col w-full">
            <Input
              {...register('title')}
              id="title"
              type="text"
              variant="title"
              width="wide"
              className="text-base border-green bg-white focus:outline-0"
            />
            {errors.title?.message && <ErrorMessage message={errors.title.message} />}
          </div>
        </div>

        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <div className={INFO_CONTAINER_STYLES}>
              <span className={LABEL_STYLES}>평점</span>
              <StarRating value={field.value} onChange={field.onChange} />
            </div>
          )}
        />

        <RouteInfoContainer label="테마" content={travelRouteInfo.themes.join(', ')} />
        <RouteInfoContainer label="지역" content={travelRouteInfo.regions.join(', ')} />
        <RouteInfoContainer label="경로" content={travelRouteInfo.travel_route.join(' - ')} />

        <Controller
          name="content"
          control={control}
          render={({ field }) => {
            if (editor) {
              editor.on('update', () => {
                field.onChange(editor.getText().trim());
              });
            }
            return (
              <div>
                <Toolbar editor={editor} />
                <Tiptap editor={editor} />
                {errors.content?.message && <ErrorMessage message={errors.content.message} />}
              </div>
            );
          }}
        />

        <ThumbnailPicker thumbnailImageUrl={thumbnail} setThumbnailImageUrl={setThumbnail} />

        <Button
          type="submit"
          size="sm"
          color="blue"
          label="등록"
          className="self-end"
          disabled={isLoading}
        />
      </form>

      {showLayerPopup && (
        <LayerPopup
          label="후기를 등록하시겠습니까?"
          setShowLayerPopup={setShowLayerPopup}
          onConfirm={() => sendReviewRequest()}
        />
      )}

      {showNavigationPopup && (
        <LayerPopup
          type="confirm"
          label={
            <>
              {mode === 'create' ? '작성' : '수정'} 중인 후기가 저장되지 않았습니다.
              <br /> 정말 페이지를 떠나시겠습니까?
            </>
          }
          onConfirm={handleNavigationConfirm}
          setShowLayerPopup={handleNavigationCancel}
        />
      )}
    </div>
  );
};

export default ReviewForm;
