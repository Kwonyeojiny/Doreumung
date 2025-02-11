'use client';

import { useGetTravelRouteByIdQuery } from '@/api/travelRouteApi';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/common/loadingSpinner/LoadingSpinner';
import ApiErrorMessage from '@/components/common/errorMessage/ApiErrorMessage';
import { useDispatch } from 'react-redux';
import { setScheduleResponse } from '@/store/travelPlanSlice';
import TravelPlan from '@/components/travel-plan/plan/TravelPlan';

const Page = () => {
  const { routeId: travel_route_id } = useParams<{ routeId: string }>();
  const dispatch = useDispatch();
  const params = useSearchParams();
  const title = params.get('title');
  const reviewId = params.get('reviewId');

  const { data, isLoading, error } = useGetTravelRouteByIdQuery(Number(travel_route_id));

  useEffect(() => {
    if (data) {
      console.log('사용자 저장 경로: ', data);
      dispatch(setScheduleResponse(data));
    }
  }, [data, dispatch]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="-mt-16 md:-mt-20">
      {error && <ApiErrorMessage />}
      <div>
        {data && <TravelPlan title={title || ''} isReadOnly={true} reviewId={Number(reviewId)} />}
      </div>
    </div>
  );
};

export default Page;
