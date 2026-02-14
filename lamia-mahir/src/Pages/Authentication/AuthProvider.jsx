/* eslint-disable react/prop-types */


import { createContext, useEffect, useState } from "react";



export const AuthContext = createContext(null);


const AuthProvider = (props) => {
    const [user, setUser] = useState('guest');
    const [loading, setLoading] = useState(true);
    

    const loginUser = (credentials) => {
        const userData = JSON.stringify(credentials)
        localStorage.setItem('user', userData)
    }
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const parseData = JSON.parse(storedUser)
        if (parseData) {
            setUser(parseData);
            console.log("userinfo: ", parseData)
            
        }
        setLoading(false);
        
    }, []);
    
    const authInfo = {  
        user,
        loading,
        loginUser
    };  

    return (
        <AuthContext.Provider value={authInfo}>
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;