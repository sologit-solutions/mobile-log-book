import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx'

import "leaflet/dist/leaflet.css";
import "./styles/theme.css";
import "./styles/ui.css";
import "./styles/icons.css";
import "./styles/cards.css";
import "./styles/layout.css";
import "./styles/pages.css";

import "simplebar-react/dist/simplebar.min.css";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App/>
    </BrowserRouter>
)
