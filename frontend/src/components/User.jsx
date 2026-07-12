import { useState } from "react";
import { UserContext } from "./UserContext.jsx";

export default function UsersProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("user");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const setUserAndPersist = (newUser) => {
        if (newUser) {
            localStorage.setItem("user", JSON.stringify(newUser));
        } else {
            localStorage.removeItem("user");
        }
        setUser(newUser);
    };

    return (
        <UserContext.Provider value={{ user, setUser: setUserAndPersist }}>
            {children}
        </UserContext.Provider>
    );
}