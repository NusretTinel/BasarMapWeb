import React, { useState, useRef, useEffect } from 'react';
import SimpleMap from './Components/Map/Map';
import SideBar from './Components/SideBar/SideBar';
import { AnalysisPanel } from "./Components/Panel/Panel";
import SimulationLoadingCard from './Components/Panel/SimulationLoadingCard';
import Navbar from './Components/Navbar/Navbar';
import NameModal from './Components/Navbar/NameModal';
import "../src/Css/AnalysisPanel.css";
import "../src/Css/PanelOverlay.css";
import "../src/Css/PanelLoader.css";

export default function App() {
    const [dataVersion, setDataVersion] = useState(0);
    const [showPanel, setShowPanel] = useState(false);
    const [panelReady, setPanelReady] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [polygonName, setPolygonName] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('Tüm Projeler');
    const [drawingMode, setDrawingMode] = useState(false);
    const [optimizationStatus, setOptimizationStatus] = useState('pending');
    const [optimizedPoints, setOptimizedPoints] = useState(null);
    const [lastPolygonWkt, setLastPolygonWkt] = useState(null);
    const [minCoverCount, setMinCoverCount] = useState(16);

    const mapRef = useRef();

    const handleSavePolygon = async (name) => {
        if (!mapRef.current) {
            console.error('Map referansı bulunamadı');
            setOptimizationStatus('error');
            return false;
        }

        try {
            setOptimizationStatus('pending'); // Start animation
            setShowPanel(true); // Open panel to show loading animation
            const wkt = await mapRef.current.savePolygon(name);
            if (!wkt) {
                console.error('Polygon save failed');
                setOptimizationStatus('error');
                return false;
            }
            setPolygonName(name);
            setLastPolygonWkt(wkt);
            return true;
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            setOptimizationStatus('error');
            return false;
        }
    };

    const handleFilterChange = (filterName) => {
        setSelectedFilter(filterName);
    };

    const handleDrawingModeChange = (mode) => {
        setDrawingMode(mode);
    };

    const handleOptimizationComplete = (points) => {
        if (points) {
            setOptimizedPoints(points);
            setOptimizationStatus('success');
        } else {
            setOptimizationStatus('error');
        }
    };

    const handleSimulationComplete = (points) => {
        setPanelReady(true);
    };

    const handleReoptimize = async (newMinCoverCount) => {
        if (!lastPolygonWkt) {
            console.error('No polygon available for re-optimization');
            setOptimizationStatus('error');
            return;
        }
        setShowPanel(true);
        setPanelReady(false);
        setOptimizationStatus('pending');
        try {
            const points = await mapRef.current.optimizePolygon(lastPolygonWkt, newMinCoverCount);
            setMinCoverCount(newMinCoverCount);
            handleOptimizationComplete(points);
        } catch (error) {
            console.error('Re-optimization error:', error);
            setOptimizationStatus('error');
        }
    };

    const handleSavePoints = async (points) => {
        if (!points || points.length === 0) {
            console.error('No points to save');
            return;
        }
        try {
            await mapRef.current.addRange(points);
            console.log('Points saved successfully');
            setOptimizationStatus('success');
        } catch (error) {
            console.error('Error saving points:', error);
            alert('Noktalar kaydedilemedi');
            setOptimizationStatus('error');
        }
    };

    const handleMapClick = () => {
        setShowPanel(false);
    };

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") {
                setShowPanel(false);
                setPanelReady(false);
                setOptimizationStatus('pending');
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        if (!showPanel) {
            setPanelReady(false);
            setOptimizationStatus('pending');
        }
    }, [showPanel]);

    const handleDataUpdate = () => setDataVersion((p) => p + 1);

    const defaultPoints = [
        { id: 1, name: "Nokta 1", lat: 40.9876, lon: 29.1234, waterLt: 2200, mahalle: "Merkez" },
        { id: 2, name: "Nokta 2", lat: 41.0011, lon: 29.1456, waterLt: 1800, mahalle: "Çınar" },
        { id: 3, name: "Nokta 3", lat: 40.9823, lon: 29.1307, waterLt: 2500, mahalle: "Dernek" },
    ];

    const handleEditItems = () => {
        console.log("Öğeleri Düzenle tıklandı");
        mapRef.current.enablePointEditing();
    };

    const handleEditMinCap = () => console.log("Minimum kapak sayısını düzenle tıklandı");

    const closePanel = () => {
        setShowPanel(false);
        setPanelReady(false);
        setOptimizationStatus('pending');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const openAnalysisPanel = () => {
        setShowPanel(true);
    };

    return (
        <div className="app-map-wrapper">
            <Navbar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                onFilterChange={handleFilterChange}
                onOpenAnalysisPanel={openAnalysisPanel}
                onStartDrawing={() => setDrawingMode(true)}
                onStopDrawing={() => setDrawingMode(false)}
                onSavePolygonWithName={handleSavePolygon}
            />
            <SideBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
            <SimpleMap
                ref={mapRef}
                refreshTrigger={dataVersion}
                dataUpdated={dataVersion}
                onOptimizationComplete={handleOptimizationComplete}
                onDataUpdated={handleDataUpdate}
                selectedFilter={selectedFilter}
                drawingMode={drawingMode}
                onDrawingModeChange={handleDrawingModeChange}
                onSavePolygonWithName={handleSavePolygon}
            />
            <NameModal
                isOpen={isNameModalOpen}
                onClose={() => setIsNameModalOpen(false)}
                onSave={handleSavePolygon}
                onOpenAnalysisPanel={() => {
                    setShowPanel(true);
                    setIsNameModalOpen(false);
                }}
            />
            {showPanel && (
                <div
                    className="ap-backdrop ap-backdrop-show"
                    onClick={closePanel}
                >
                    <div
                        className="ap-backdrop-stop"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {!panelReady ? (
                            <SimulationLoadingCard
                                optimizationStatus={optimizationStatus}
                                optimizedPoints={optimizedPoints}
                                onComplete={handleSimulationComplete}
                            />
                        ) : (
                            <AnalysisPanel
                                minCoverCount={minCoverCount}
                                capacityLtPerMin={1600}
                                points={optimizedPoints || defaultPoints}
                                onMapClick={handleMapClick}
                                onEditClick={handleEditItems}
                                onEditMinCap={handleEditMinCap}
                                onSave={handleSavePoints}
                                onSimulate={handleReoptimize}
                                className="ap-tall ap-showy"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}