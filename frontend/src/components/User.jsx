import { useState, createContext } from "react";
export const UserContext = createContext();

export default function UsersProvider({ children }){
    const [ user, setUser ] =  useState(null);
    return (
        <>
            <UserContext.Provider value={{ user, setUser }}>
                {children}
            </UserContext.Provider>
        </>
    );
};
