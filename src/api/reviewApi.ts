import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';
import {
  EditReviewRequestType,
  EditReviewResponseType,
  GetReviewListRequestType,
  GetReviewListResponseType,
  GetReviewDetailResponseType,
  PostReviewRequestType,
  PostReviewResponseType,
  DeleteReviewRequestType,
  GetTravelRouteInfoResponseType,
  GetTravelRouteInfoRequestType,
  TravelRouteInfoType,
} from '@/app/travel-reviews/types';

const REVIEW_LIST_TAG = { type: 'Reviews', id: 'ReviewList' } as const;

const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery,
  tagTypes: ['Reviews'],
  endpoints: build => ({
    postReview: build.mutation<PostReviewResponseType, PostReviewRequestType>({
      query: review => ({
        url: '/reviews',
        method: 'POST',
        body: review,
      }),
      invalidatesTags: [REVIEW_LIST_TAG],
    }),
    editReview: build.mutation<EditReviewResponseType, EditReviewRequestType>({
      query: ({ review_id, body, deleted_urls }) => ({
        url: `/reviews/${review_id}`,
        method: 'PATCH',
        body: { body, deleted_urls },
      }),
      invalidatesTags: (result, _, { review_id: id }) => [{ type: 'Reviews', id }],
    }),
    getReviewList: build.query<GetReviewListResponseType, GetReviewListRequestType>({
      query: ({ page, size = 9, order_by = 'created_at', order = 'desc' }) => ({
        url: `/reviews?page=${page}&size=${size}&order_by=${order_by}&order=${order}`,
        method: 'GET',
      }),
      providesTags: result =>
        result
          ? [
              ...result.reviews.map(({ review_id: id }) => ({ type: 'Reviews', id } as const)),
              REVIEW_LIST_TAG,
            ]
          : [REVIEW_LIST_TAG],
    }),
    getReviewDetail: build.query<GetReviewDetailResponseType, number>({
      query: review_id => ({
        url: `/reviews/${review_id}`,
        method: 'GET',
      }),
      providesTags: (result, _, id) => [{ type: 'Reviews', id }],
    }),
    deleteReview: build.mutation<void, DeleteReviewRequestType>({
      query: ({ review_id }) => ({
        url: `/reviews/${review_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, _, { review_id: id }) => [{ type: 'Reviews', id }],
    }),
    getTravelRouteInfo: build.query<GetTravelRouteInfoResponseType, GetTravelRouteInfoRequestType>({
      query: ({ travel_route_id }) => ({
        url: `/travelroute/${travel_route_id}`,
        method: 'GET',
      }),
      transformResponse: (response: TravelRouteInfoType) => {
        const { user_id, travel_route, config } = response;
        const { regions, themes } = config;

        return { user_id, travel_route, regions, themes };
      },
    }),
  }),
});

export const {
  usePostReviewMutation,
  useEditReviewMutation,
  useGetReviewListQuery,
  useGetReviewDetailQuery,
  useDeleteReviewMutation,
  useGetTravelRouteInfoQuery,
} = reviewApi;

export default reviewApi;
