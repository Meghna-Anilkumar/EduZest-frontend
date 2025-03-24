import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; 
import userReducer from "./reducers/userReducer";
import adminReducer from "./reducers/adminReducer"
import categoryReducer from "./reducers/categoryReducer"
import courseReducer from "./reducers/courseReducer";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "admin"], 
};

const rootReducer = combineReducers({
  user: userReducer,
  admin: adminReducer,
  category: categoryReducer,
  course:courseReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
export default store;