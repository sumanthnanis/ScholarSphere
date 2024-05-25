import { configureStore } from "./persistConfig";
import authReducer from "./authSlice";

const { store, persistor } = configureStore();

export { store, persistor };
