import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./redux/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CourseFormProvider } from "./components/context/CourseFormContext.tsx";
import { SocketProvider } from "./components/context/socketContext.tsx";

const { VITE_GOOGLE_CLIENT_ID } = import.meta.env;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={String(VITE_GOOGLE_CLIENT_ID)}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SocketProvider>
            <CourseFormProvider>
              <App />
            </CourseFormProvider>
          </SocketProvider>
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);
