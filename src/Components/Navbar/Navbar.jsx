import React, { useState, useRef, useEffect } from 'react';
import { calculateContainerNeeds } from '../../utils/calculateContainerNeeds';
import NameModal from './NameModal';
import './Navbar.css';
import {
    PenTool,
    Save,
    Menu,
    X,
    ChevronDown,
    LayoutGrid,
    Trash2,
    MapPin,
    Disc,
    Truck,
} from 'lucide-react';

const Navbar = ({ isSidebarOpen, toggleSidebar, onFilterChange, onOpenAnalysisPanel, onStartDrawing, onStopDrawing, onSavePolygonWithName, getPolygonArea }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Tüm Projeler');
    const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionStatus, setActionStatus] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [polygonArea, setPolygonArea] = useState(null);

    const handleFilterChange = (name) => {
        const selected = filterOptions.find((opt) => opt.name === name);
        setSelectedFilter(name);
        setSelectedCategory(selected?.category || 'all');
        setIsFilterOpen(false);
        onFilterChange?.(name);
    };

    const handleAddButton = () => {
        setActionStatus('1');
        setIsProjectMenuOpen(false);
        onStartDrawing?.();
    };

    const handleCancelButton = () => {
        setActionStatus('0');
        setIsProjectMenuOpen(false);
        onStopDrawing?.();
    };

    const handleSaveButton = async () => {
        setActionStatus('0');
        setIsProjectMenuOpen(false);
        onStopDrawing?.();
        try {
            const area = await getPolygonArea();
            setPolygonArea(area);
            setIsModalOpen(true);
        } catch (e) {
            console.error('Alan hesaplanamadı:', e);
            alert('Poligon alanı hesaplanamadı. Lütfen poligonu kontrol edin.');
        }
    };

    const projectMenuRef = useRef(null);
    const filterMenuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isProjectMenuOpen && projectMenuRef.current && !projectMenuRef.current.contains(e.target)) {
                setIsProjectMenuOpen(false);
            }
            if (isFilterOpen && filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
                setIsFilterOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProjectMenuOpen, isFilterOpen]);

    const filterOptions = [
        { id: 1, name: 'Tüm Projeler', icon: <LayoutGrid size={18} />, color: '#3b82f6', category: 'all' },
        { id: 2, name: 'Atık Yönetimi', icon: <Trash2 size={18} />, color: '#10b981', category: 'container' },
        { id: 3, name: 'Bölge Planlama', icon: <MapPin size={18} />, color: '#f59e0b', category: 'gatheringArea' },
        { id: 4, name: 'Altyapı Yönetimi', icon: <Disc size={18} />, color: '#ec4899', category: 'manhole' },
        { id: 5, name: 'Otopark Planlama', icon: <Truck size={18} />, color: '#8b5cf6', category: 'parking' },
    ];

    return (
        <>
            <div className="custom-navbar">
                <div className="navbar-left">
                    <button onClick={toggleSidebar} className="sidebar-toggle-btn">
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <h1 className="geo-title">GEOBelediye</h1>
                </div>
                <div className="project-start-wrapper">
                    <button
                        className={`project-start-btn ${isProjectMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                    >
                        Proje Başlat
                    </button>
                    {isProjectMenuOpen && (
                        <div className="project-actions-menu" ref={projectMenuRef}>
                            <button className="action-btn add" title="Polygon Ekle" onClick={handleAddButton}>
                                <PenTool size={20} />
                            </button>
                            <button className="action-btn save" title="Kaydet" onClick={handleSaveButton}>
                                <Save size={20} />
                            </button>
                            <button className="action-btn cancel" title="İptal" onClick={handleCancelButton}>
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>
                <div className="navbar-right">
                    <div className="filter-dropdown">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`filter-trigger ${isFilterOpen ? 'active' : ''}`}
                        >
                            <div className="filter-selected">
                                {filterOptions.find((opt) => opt.name === selectedFilter)?.icon}
                                <span>{selectedFilter}</span>
                            </div>
                            <ChevronDown
                                className={`chevron-icon ${isFilterOpen ? 'rotated' : ''}`}
                                size={18}
                            />
                        </button>
                        {isFilterOpen && (
                            <div className="dropdown-menu filter-menu" ref={filterMenuRef}>
                                <div className="filter-header">
                                    <h4>Proje Teması Seçin</h4>
                                </div>
                                <div className="filter-options">
                                    {filterOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            className={`filter-option ${selectedFilter === option.name ? 'active' : ''}`}
                                            onClick={() => handleFilterChange(option.name)}
                                        >
                                            <div className="option-icon" style={{ color: option.color }}>
                                                {option.icon}
                                            </div>
                                            <span>{option.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="model-overlay">
                <NameModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setPolygonArea(null);
                    }}
                    onSave={(data) => onSavePolygonWithName(data)}
                    onOpenAnalysisPanel={onOpenAnalysisPanel}
                    category={selectedCategory}
                    selectedFilter={selectedFilter}
                    area={polygonArea}
                />
            </div>
        </>
    );
};

export default Navbar;