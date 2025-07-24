import React, { useState, useEffect, useMemo } from 'react';
import '../../Css/AnalysisPanel.css';

export function AnalysisPanel({
                                  minCoverCount,
                                  capacityLtPerMin,
                                  points,
                                  onMapClick,
                                  onEditClick,
                                  onEditMinCap,
                                  onSave,
                                  onSimulate,
                                  className = '',
                                  selectedFilter,
                              }) {
    const [entered, setEntered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [tempCoverCount, setTempCoverCount] = useState(minCoverCount);
    const [isSimulating, setIsSimulating] = useState(false);

    useEffect(() => {
        setEntered(true);
    }, []);

    useEffect(() => {
        setTempCoverCount(minCoverCount);
        setIsSimulating(false);
    }, [minCoverCount]);

    const handleEditClick = () => {
        setIsEditing(true);
        setIsSimulating(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            finishEditing();
        }
    };

    const finishEditing = () => {
        setIsEditing(false);
        setIsSimulating(true);
    };

    const handleSaveButtonClick = () => {
        if (isEditing) {
            finishEditing();
            onSimulate?.(Number(tempCoverCount));
        } else if (isSimulating) {
            onSimulate?.(Number(tempCoverCount));
        } else {
            const formattedPoints = points
                .map((point, index) => ({
                    id: point.id && point.id !== 0 ? point.id : `temp-${index}`,
                    name: point.name || `Optimized Bin-${index + 1}`,
                    wkt: point.wkt || (point.lat && point.lon ? `POINT(${point.lon} ${point.lat})` : null),
                    typeN: selectedFilter,
                }))
                .filter((point) => point.wkt && point.wkt !== 'POINT(0 0)');
            if (formattedPoints.length === 0) {
                console.warn('No valid points to save');
                return;
            }
            onSave?.(formattedPoints);
        }
    };

    const scrollRowsThreshold = 6;
    const shouldScroll = points.length > scrollRowsThreshold;

    const capacityUnit = selectedFilter === 'Atık Yönetimi' ? 'kg/gün' : 'lt/dk';

    const tableMarkup = useMemo(
        () => (
            <table className="ap-table">
                <thead>
                <tr>
                    <th>Nokta Adı</th>
                    <th>Konum</th>
                    <th>{selectedFilter === 'Atık Yönetimi' ? 'Tahmini Atık (kg)' : 'Tahmini Su Tutma (lt)'}</th>
                    <th>Mahalle İsmi</th>
                    <th>Tür</th>
                </tr>
                </thead>
                <tbody>
                {points.map((p, index) => {
                    let lon = 0,
                        lat = 0;
                    if (p.wkt) {
                        const wktMatch = p.wkt.match(/POINT\s*\(\s*([-]?\d*\.?\d+)\s+([-]?\d*\.?\d+)\s*\)/);
                        if (wktMatch) {
                            lon = Number(wktMatch[1]).toFixed(4);
                            lat = Number(wktMatch[2]).toFixed(4);
                        } else {
                            console.warn(`Invalid WKT format for point: ${p.wkt}`);
                        }
                    } else if (p.lon && p.lat) {
                        lon = Number(p.lon).toFixed(4);
                        lat = Number(p.lat).toFixed(4);
                    }
                    return (
                        <tr key={p.id && p.id !== 0 ? p.id : `point-${index}`}>
                            <td>{p.name || `Nokta-${index + 1}`}</td>
                            <td>{lat === '0.0000' && lon === '0.0000' ? 'N/A' : `${lat}, ${lon}`}</td>
                            <td>{p.waterLt || p.totalWastePerDay || 'N/A'}</td>
                            <td>{p.mahalle || 'N/A'}</td>
                            <td>{p.typeN || selectedFilter || 'Bilinmiyor'}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        ),
        [points, selectedFilter]
    );

    return (
        <div
            className={`ap-root ${entered ? 'ap-entered' : 'ap-enter'} ${className}`}
            role="region"
            aria-label="Analiz Sonuçları"
        >
            <header className="ap-header">
                <h2>Analiz Sonuçları</h2>
                <div className="ap-header-actions">
                    <button type="button" className="ap-btn" onClick={onMapClick}>
                        Haritayı Görüntüle
                    </button>
                    <button type="button" className="ap-btn" onClick={onEditClick}>
                        Öğeleri Düzenle
                    </button>
                </div>
            </header>

            <div className="ap-metrics">
                <div className="ap-metric-card ap-metric-orange">
                    <div className="ap-metric-body">
                        <span className="ap-metric-label">Önerilen Minimum Kapak Sayısı</span>
                        <span className={`ap-metric-value ${isEditing ? 'editing' : ''}`}>
              {isEditing ? (
                  <input
                      type="number"
                      min="1"
                      className="ap-metric-input"
                      value={tempCoverCount}
                      onChange={(e) => setTempCoverCount(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                  />
              ) : (
                  tempCoverCount
              )}
            </span>
                    </div>
                    <button
                        type="button"
                        className="ap-metric-edit"
                        aria-label="Minimum kapak sayısını düzenle"
                        onClick={handleEditClick}
                    >
                        <PencilIcon />
                    </button>
                </div>

                <div className="ap-metric-card ap-metric-blue">
                    <div className="ap-metric-body">
                        <span className="ap-metric-label">Altyapı Kapasitesi</span>
                        <span className="ap-metric-value">
              {capacityLtPerMin.toLocaleString('tr-TR')}{' '}
                            <span className="ap-metric-unit">{capacityUnit}</span>
            </span>
                    </div>
                </div>
            </div>

            <div className="ap-table-wrapper">
                {shouldScroll ? <div className="ap-table-scroll">{tableMarkup}</div> : tableMarkup}
                <div className="ap-table-actions">
                    <button type="button" className="ap-save-btn" onClick={handleSaveButtonClick}>
                        {isSimulating ? 'Simüle Et' : 'Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function PencilIcon({ size = 20 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            className="ap-pencil-icon"
        >
            <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm2.92 2.33H5v-0.92L14.06 7.52l0.92 0.92L5.92 19.58ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"
                fill="currentColor"
            />
        </svg>
    );
}