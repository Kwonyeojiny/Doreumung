import { TravelConfig } from '@/app/travel-plan/types';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: TravelConfig & {
  meals: number[];
  selectedToggles: number[];
  themeToggles: number[];
  mealToggles: number[];
  scheduleResponse: unknown;
  tempSavedRoute: unknown;
  justSaved: boolean;
} = {
  regions: [],
  themes: [],
  schedule: {
    breakfast: false,
    morning: 0,
    lunch: false,
    afternoon: 0,
    dinner: false,
  },
  meals: [],
  selectedToggles: [],
  themeToggles: [],
  mealToggles: [],
  scheduleResponse: null,
  tempSavedRoute: null,
  justSaved: false,
};

export const selectTravelPlanConfig = createSelector(
  state => state.travelPlan,
  travelPlan => ({
    regions: travelPlan.regions,
    themes: travelPlan.themes,
    schedule: travelPlan.schedule,
  }),
);

const travelPlanSlice = createSlice({
  name: 'travelPlan',
  initialState,
  reducers: {
    setRegions(state, action: PayloadAction<string[]>) {
      state.regions = action.payload;
    },
    setThemes(state, action: PayloadAction<string[]>) {
      state.themes = action.payload;
    },
    updateSchedule(state, action: PayloadAction<Partial<typeof initialState.schedule>>) {
      state.schedule = { ...state.schedule, ...action.payload };
    },
    setScheduleResponse(state, action: PayloadAction<unknown>) {
      state.scheduleResponse = action.payload;
    },
    setMeals(state, action: PayloadAction<number[]>) {
      state.meals = action.payload;
      state.schedule.breakfast = action.payload.includes(0);
      state.schedule.lunch = action.payload.includes(1);
      state.schedule.dinner = action.payload.includes(2);
    },
    setThemeToggles(state, action: PayloadAction<number[]>) {
      state.themeToggles = action.payload;
    },
    setMealToggles(state, action: PayloadAction<number[]>) {
      state.mealToggles = action.payload;
    },
    setTempSavedRoute(state, action: PayloadAction<unknown>) {
      state.tempSavedRoute = action.payload;
    },
    resetTravelPlan() {
      return initialState;
    },
    setJustSaved: (state, action: PayloadAction<boolean>) => {
      state.justSaved = action.payload;
    },
  },
});

export const {
  setRegions,
  setThemes,
  updateSchedule,
  setScheduleResponse,
  setMeals,
  setThemeToggles,
  setMealToggles,
  setTempSavedRoute,
  resetTravelPlan,
  setJustSaved,
} = travelPlanSlice.actions;

export default travelPlanSlice.reducer;
