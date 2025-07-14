import {createContext, useContext, useEffect, useMemo} from "react";
import EventEmitter from 'eventemitter3';

const EventsContext = createContext(null);

export const EventsProvider = ({ url, children }) => {
    const eventBus = useMemo(() => new EventEmitter(), []);

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log("[WebSocket] Connected");
        }

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            eventBus.emit(`${message.type}:${message.name}`, message.data);
        }

        ws.onclose = () => {
            console.log("[WebSocket] Disconnected");
        }

        return () => {
            ws.close();
            console.log("[WebSocket] Disconnected");
        };
    }, [eventBus, url]);

    return (
        <EventsContext.Provider value={eventBus}>
            {children}
        </EventsContext.Provider>
    )
}

export const useEvents = () => {
    const context = useContext(EventsContext);
    if (!context) {
        throw new Error("useEvents must be used within an EventsProvider");
    }
    return context;
}