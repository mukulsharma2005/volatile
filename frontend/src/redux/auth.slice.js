import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'auth',
    initialState: {
        user: {},
        loading: false,
        emailToVerify: "",
    },
    reducers: {
        setUser : (state,action)=>{
            state.user = action.payload
        },
        setLoading : (state,action)=>{
            state.loading = action.payload
        },
        setEmailToVerify: (state,action)=>{
            state.emailToVerify = action.payload
        },
    },
});

export const { setUser, setLoading, setEmailToVerify } = userSlice.actions;
export default userSlice.reducer;