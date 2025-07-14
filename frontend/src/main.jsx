import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import {EventsProvider} from "./context/EventsContext.jsx";
import GatheringTable from "./components/GatheringTable.jsx";
import './index.css'

createRoot(document.getElementById('root')).render(
    <EventsProvider url="http://localhost:8080/ws">
        <StrictMode>
            <App>
                <GatheringTable />
            </App>
        </StrictMode>
    </EventsProvider>
)
