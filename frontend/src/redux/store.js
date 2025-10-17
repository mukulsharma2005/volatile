
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import authReducer from './auth.slice.js';
import chatsReducer from './chats.slice.js';
import messageReducer from './message.slice.js';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

const chatPersistConfig = {
  key: 'chats',
  storage: storage,
  blacklist: ['currentChatId'],
}

const rootReducer = combineReducers({
    auth: persistReducer({key: 'auth',storage},authReducer),
    chats: persistReducer(chatPersistConfig, chatsReducer),
    message:persistReducer({key: 'messages',storage},messageReducer),
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);