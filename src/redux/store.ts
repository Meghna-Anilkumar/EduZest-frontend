import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Uses local storage
import userReducer from "./reducers/userReducer";
import adminReducer from "./reducers/adminReducer"

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], 
};

const adminPersistedReducer = persistReducer(persistConfig, adminReducer);
const userPersistedReducer = persistReducer(persistConfig, userReducer);

const store = configureStore({
  reducer: {
    user: userPersistedReducer,
    admin: adminPersistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});


export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
export default store;
