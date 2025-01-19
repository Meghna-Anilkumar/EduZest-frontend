import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './reducers/userReducer';


const rootReducer=combineReducers({
    user:userReducer,
})

const store = configureStore({
    reducer: rootReducer,
});

//to ensure actions allowed by your Redux store(for type safety)
export type AppDispatch = typeof store.dispatch;


export type RootState = ReturnType<typeof rootReducer>;

export default store;