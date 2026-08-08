import * as authApi from "../api/authApi";

const storeTokens = (tokens = {}) => {
    if (tokens.accessToken) {
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("token", tokens.accessToken);
    }

    if (tokens.idToken) {
        localStorage.setItem("idToken", tokens.idToken);
    }

    if (tokens.refreshToken) {
        localStorage.setItem("refreshToken", tokens.refreshToken);
    }
};

const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
};

const authService = {

    register: async(data)=>{

        const response=await authApi.register(data);

        return response.data;

    },

    setPassword: async(data)=>{

        const response=await authApi.setPassword(data);

        return response.data;

    },

    login: async(data)=>{

        const response=await authApi.login(data);

        storeTokens(response.data.data);

        return response.data;

    },

    forgotPassword: async(data)=>{

        const response=await authApi.forgotPassword(data);

        return response.data;

    },

    resetPassword: async(data)=>{

        const response=await authApi.resetPassword(data);

        return response.data;

    },

    logout(){

        clearTokens();

    }

}

export default authService;
