import React, { useEffect, useState } from "react";

export default function SimulationLoadingCard({ optimizationStatus, optimizedPoints, onComplete }) {
    const [phase, setPhase] = useState(1); // 1: başlıyor, 2: bulut, 3: başarılı, 4: tik animasyonu, 5: hata
    const [startingText, setStartingText] = useState('');
    const [successText, setSuccessText] = useState('');
    const [errorText, setErrorText] = useState('');

    const startingMessage = "Simülasyon başlıyor...";
    const successMessage = "Simülasyon başarılı";
    const errorMessage = "Simülasyon başarısız oldu";

    useEffect(() => {
        if (phase === 1) {
            let index = 0;
            const typeInterval = setInterval(() => {
                if (index < startingMessage.length) {
                    setStartingText(startingMessage.substring(0, index + 1));
                    index++;
                } else {
                    clearInterval(typeInterval);
                    setTimeout(() => setPhase(2), 1000);
                }
            }, 70);
            return () => clearInterval(typeInterval);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 2) {
            const minLoadingDuration = 2000; // Minimum 2 seconds for loading animation
            const timer = setTimeout(() => {
                if (optimizationStatus === 'success') {
                    setPhase(3);
                } else if (optimizationStatus === 'error') {
                    setPhase(5);
                }
            }, minLoadingDuration);
            return () => clearTimeout(timer);
        }
    }, [phase, optimizationStatus]);

    useEffect(() => {
        if (phase === 3) {
            let index = 0;
            const typeInterval = setInterval(() => {
                if (index < successMessage.length) {
                    setSuccessText(successMessage.substring(0, index + 1));
                    index++;
                } else {
                    clearInterval(typeInterval);
                    setTimeout(() => {
                        setPhase(4);
                        setTimeout(() => onComplete?.(optimizedPoints), 1400);
                    }, 700);
                }
            }, 55);
            return () => clearInterval(typeInterval);
        }
    }, [phase, optimizedPoints, onComplete]);

    useEffect(() => {
        if (phase === 5) {
            let index = 0;
            const typeInterval = setInterval(() => {
                if (index < errorMessage.length) {
                    setErrorText(errorMessage.substring(0, index + 1));
                    index++;
                } else {
                    clearInterval(typeInterval);
                    setTimeout(() => onComplete?.(null), 800);
                }
            }, 80);
            return () => clearInterval(typeInterval);
        }
    }, [phase, onComplete]);

    return (
        <div className="ap-root ap-loading-card ap-enter ap-entered">
            <div className="ap-simulation-center">
                {phase === 1 && (
                    <div className="ap-typewriter">
                        <span className="ap-typewriter-text">{startingText}</span>
                        <span className="ap-typewriter-cursor">|</span>
                    </div>
                )}
                {phase === 2 && (
                    <div className="ap-loading-center">
                        <div className="loader" role="status" aria-label="Yükleniyor">
                            <div className="snow">
                                {[...Array(22)].map((_, i) => (
                                    <span
                                        key={i}
                                        style={{ animationDuration: `${15 / (10 + i % 11)}s` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {phase === 3 && (
                    <div className="ap-typewriter ap-success">
                        <span className="ap-typewriter-text">{successText}</span>
                        <span className="ap-typewriter-cursor">|</span>
                    </div>
                )}
                {phase === 4 && (
                    <div className="ap-success-container">
                        <div className="ap-typewriter ap-success">
                            <span className="ap-typewriter-text">{successText}</span>
                        </div>
                        <div className="ap-checkmark-container">
                            <svg className="ap-checkmark" viewBox="0 0 52 52">
                                <circle className="ap-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                <path
                                    className="ap-checkmark-check"
                                    fill="none"
                                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                                />
                            </svg>
                        </div>
                    </div>
                )}
                {phase === 5 && (
                    <div className="ap-typewriter ap-error">
                        <span className="ap-typewriter-text">{errorText}</span>
                        <span className="ap-typewriter-cursor">|</span>
                    </div>
                )}
            </div>
        </div>
    );
}