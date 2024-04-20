import { createContext, useContext, useState } from "react";
import { RateLimitStatus } from "./Entry";

export type EntryContextType = {
    rlStates: Map<string, RateLimitStatus>;
    setRlStates: React.Dispatch<React.SetStateAction<Map<string, RateLimitStatus>>>;
};

// Create a context with the defined type
export const EntryContext = createContext<EntryContextType | null>(null);
export const useEntryContext = () => {
    const context = useContext(EntryContext);
    if (context === null) {
        throw new Error("useSchemaContext must be used within a SchemaProvider");
    }
    return context;
};
export const EntryContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [rlStates, setRlStates] = useState<Map<string, RateLimitStatus>>(new Map());
    return (
        <EntryContext.Provider value={{ rlStates, setRlStates }}>
            {children}
        </EntryContext.Provider>
    );
}