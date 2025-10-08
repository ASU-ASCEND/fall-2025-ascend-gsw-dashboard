import { useDataAccumulator } from '@/hooks/useDataAccumulator';
import * as Plot from '@observablehq/plot';
import React, { useEffect, useRef } from 'react';

interface FIDOProps {
    telemetryData: any;
}

const FIDO: React.FC<FIDOProps> = ({ telemetryData }) => {
    const { latestData, chartData } = useDataAccumulator(telemetryData, {
        maxDataPoints: 100,
        shouldAdd: (data) => {
            // Check if MTK3339 or BMP390 fields exist at root level
            const hasMTKData = data && data.mtk3339_latitude !== undefined;
            const hasBMPData = data && data.bmp390_temp_c !== undefined;
            return hasMTKData || hasBMPData;
        },
        extractData: (data) => {
            return {
                // Use millis from telemetry data for x-axis
                millis: data.millis || Date.now(),
                // MTK3339 GPS Data
                mtk_year: data.mtk3339_year,
                mtk_month: data.mtk3339_month,
                mtk_day: data.mtk3339_day,
                mtk_hour: data.mtk3339_hour,
                mtk_minute: data.mtk3339_minute,
                mtk_second: data.mtk3339_second,
                latitude: data.mtk3339_latitude,
                longitude: data.mtk3339_longitude,
                speed: data.mtk3339_speed,
                heading: data.mtk3339_heading,
                gps_altitude: data.mtk3339_altitude,
                satellites: data.mtk3339_satellites,
                // BMP390 Atmospheric Data
                bmp_temp: data.bmp390_temp_c,
                pressure: data.bmp390_pressure_pa,
                baro_altitude: data.bmp390_altitude_m
            };
        }
    });

    // Refs for chart containers
    const gpsPosChartRef = useRef<HTMLDivElement>(null);
    const altitudeChartRef = useRef<HTMLDivElement>(null);
    const speedHeadingChartRef = useRef<HTMLDivElement>(null);
    const atmosphericChartRef = useRef<HTMLDivElement>(null);
    const satellitesChartRef = useRef<HTMLDivElement>(null);

    // Refs to track current plots for safe cleanup
    const gpsPosPlotRef = useRef<Element | null>(null);
    const altitudePlotRef = useRef<Element | null>(null);
    const speedHeadingPlotRef = useRef<Element | null>(null);
    const atmosphericPlotRef = useRef<Element | null>(null);
    const satellitesPlotRef = useRef<Element | null>(null);

    // Create GPS position chart
    useEffect(() => {
        if (!gpsPosChartRef.current || chartData.length === 0) return;

        // Calculate time domain based on actual millis values from the data
        const millisValues = chartData.map(d => d.millis).filter(m => m !== undefined);

        let timeDomain: [number, number];
        if (millisValues.length > 0) {
            const minMillis = Math.min(...millisValues);
            const maxMillis = Math.max(...millisValues);
            const padding = (maxMillis - minMillis) * 0.05 || 1000;
            timeDomain = [minMillis - padding, maxMillis + padding];
        } else {
            timeDomain = [0, 60000];
        }

        const gpsPosPlot = Plot.plot({
            height: 200,
            marginLeft: 60,
            marginRight: 20,
            marginTop: 10,
            marginBottom: 40,
            x: {
                label: "Time (millis) →",
                type: "linear",
                domain: timeDomain,
                tickFormat: (d: number) => (d / 1000).toFixed(1) + 's'
            },
            y: {
                label: "↑ GPS Position",
                grid: true
            },
            marks: [
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "latitude",
                    stroke: "#ef4444",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "longitude",
                    stroke: "#22c55e",
                    strokeWidth: 2,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (gpsPosPlotRef.current && gpsPosChartRef.current && gpsPosChartRef.current.contains(gpsPosPlotRef.current)) {
            gpsPosChartRef.current.removeChild(gpsPosPlotRef.current);
        }

        // Add new plot
        if (gpsPosChartRef.current) {
            gpsPosChartRef.current.appendChild(gpsPosPlot);
            gpsPosPlotRef.current = gpsPosPlot;
        }

        return () => {
            if (gpsPosPlotRef.current && gpsPosChartRef.current && gpsPosChartRef.current.contains(gpsPosPlotRef.current)) {
                gpsPosChartRef.current.removeChild(gpsPosPlotRef.current);
            }
            gpsPosPlotRef.current = null;
        };
    }, [chartData]);

    // Create altitude comparison chart
    useEffect(() => {
        if (!altitudeChartRef.current || chartData.length === 0) return;

        const millisValues = chartData.map(d => d.millis).filter(m => m !== undefined);

        let timeDomain: [number, number];
        if (millisValues.length > 0) {
            const minMillis = Math.min(...millisValues);
            const maxMillis = Math.max(...millisValues);
            const padding = (maxMillis - minMillis) * 0.05 || 1000;
            timeDomain = [minMillis - padding, maxMillis + padding];
        } else {
            timeDomain = [0, 60000];
        }

        const altitudePlot = Plot.plot({
            height: 200,
            marginLeft: 60,
            marginRight: 20,
            marginTop: 10,
            marginBottom: 40,
            x: {
                label: "Time (millis) →",
                type: "linear",
                domain: timeDomain,
                tickFormat: (d: number) => (d / 1000).toFixed(1) + 's'
            },
            y: {
                label: "↑ Altitude (m)",
                grid: true
            },
            marks: [
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "gps_altitude",
                    stroke: "#3b82f6",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "baro_altitude",
                    stroke: "#f59e0b",
                    strokeWidth: 2,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (altitudePlotRef.current && altitudeChartRef.current && altitudeChartRef.current.contains(altitudePlotRef.current)) {
            altitudeChartRef.current.removeChild(altitudePlotRef.current);
        }

        // Add new plot
        if (altitudeChartRef.current) {
            altitudeChartRef.current.appendChild(altitudePlot);
            altitudePlotRef.current = altitudePlot;
        }

        return () => {
            if (altitudePlotRef.current && altitudeChartRef.current && altitudeChartRef.current.contains(altitudePlotRef.current)) {
                altitudeChartRef.current.removeChild(altitudePlotRef.current);
            }
            altitudePlotRef.current = null;
        };
    }, [chartData]);

    // Create speed and heading chart
    useEffect(() => {
        if (!speedHeadingChartRef.current || chartData.length === 0) return;

        const millisValues = chartData.map(d => d.millis).filter(m => m !== undefined);

        let timeDomain: [number, number];
        if (millisValues.length > 0) {
            const minMillis = Math.min(...millisValues);
            const maxMillis = Math.max(...millisValues);
            const padding = (maxMillis - minMillis) * 0.05 || 1000;
            timeDomain = [minMillis - padding, maxMillis + padding];
        } else {
            timeDomain = [0, 60000];
        }

        const speedHeadingPlot = Plot.plot({
            height: 200,
            marginLeft: 60,
            marginRight: 20,
            marginTop: 10,
            marginBottom: 40,
            x: {
                label: "Time (millis) →",
                type: "linear",
                domain: timeDomain,
                tickFormat: (d: number) => (d / 1000).toFixed(1) + 's'
            },
            y: {
                label: "↑ Speed (km/h) / Heading (°)",
                grid: true
            },
            marks: [
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "speed",
                    stroke: "#8b5cf6",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "heading",
                    stroke: "#ec4899",
                    strokeWidth: 2,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (speedHeadingPlotRef.current && speedHeadingChartRef.current && speedHeadingChartRef.current.contains(speedHeadingPlotRef.current)) {
            speedHeadingChartRef.current.removeChild(speedHeadingPlotRef.current);
        }

        // Add new plot
        if (speedHeadingChartRef.current) {
            speedHeadingChartRef.current.appendChild(speedHeadingPlot);
            speedHeadingPlotRef.current = speedHeadingPlot;
        }

        return () => {
            if (speedHeadingPlotRef.current && speedHeadingChartRef.current && speedHeadingChartRef.current.contains(speedHeadingPlotRef.current)) {
                speedHeadingChartRef.current.removeChild(speedHeadingPlotRef.current);
            }
            speedHeadingPlotRef.current = null;
        };
    }, [chartData]);

    // Create atmospheric conditions chart
    useEffect(() => {
        if (!atmosphericChartRef.current || chartData.length === 0) return;

        const millisValues = chartData.map(d => d.millis).filter(m => m !== undefined);

        let timeDomain: [number, number];
        if (millisValues.length > 0) {
            const minMillis = Math.min(...millisValues);
            const maxMillis = Math.max(...millisValues);
            const padding = (maxMillis - minMillis) * 0.05 || 1000;
            timeDomain = [minMillis - padding, maxMillis + padding];
        } else {
            timeDomain = [0, 60000];
        }

        const atmosphericPlot = Plot.plot({
            height: 200,
            marginLeft: 60,
            marginRight: 20,
            marginTop: 10,
            marginBottom: 40,
            x: {
                label: "Time (millis) →",
                type: "linear",
                domain: timeDomain,
                tickFormat: (d: number) => (d / 1000).toFixed(1) + 's'
            },
            y: {
                label: "↑ Temperature (°C) / Pressure (Pa)",
                grid: true
            },
            marks: [
                Plot.areaY(chartData, {
                    x: "millis",
                    y: "pressure",
                    fill: "#06b6d4",
                    fillOpacity: 0.1
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "bmp_temp",
                    stroke: "#f59e0b",
                    strokeWidth: 3,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (atmosphericPlotRef.current && atmosphericChartRef.current && atmosphericChartRef.current.contains(atmosphericPlotRef.current)) {
            atmosphericChartRef.current.removeChild(atmosphericPlotRef.current);
        }

        // Add new plot
        if (atmosphericChartRef.current) {
            atmosphericChartRef.current.appendChild(atmosphericPlot);
            atmosphericPlotRef.current = atmosphericPlot;
        }

        return () => {
            if (atmosphericPlotRef.current && atmosphericChartRef.current && atmosphericChartRef.current.contains(atmosphericPlotRef.current)) {
                atmosphericChartRef.current.removeChild(atmosphericPlotRef.current);
            }
            atmosphericPlotRef.current = null;
        };
    }, [chartData]);

    // Create satellites count chart
    useEffect(() => {
        if (!satellitesChartRef.current || chartData.length === 0) return;

        const millisValues = chartData.map(d => d.millis).filter(m => m !== undefined);

        let timeDomain: [number, number];
        if (millisValues.length > 0) {
            const minMillis = Math.min(...millisValues);
            const maxMillis = Math.max(...millisValues);
            const padding = (maxMillis - minMillis) * 0.05 || 1000;
            timeDomain = [minMillis - padding, maxMillis + padding];
        } else {
            timeDomain = [0, 60000];
        }

        const satellitesPlot = Plot.plot({
            height: 200,
            marginLeft: 60,
            marginRight: 20,
            marginTop: 10,
            marginBottom: 40,
            x: {
                label: "Time (millis) →",
                type: "linear",
                domain: timeDomain,
                tickFormat: (d: number) => (d / 1000).toFixed(1) + 's'
            },
            y: {
                label: "↑ Satellite Count",
                grid: true,
                domain: [0, 20]
            },
            marks: [
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "satellites",
                    stroke: "#6366f1",
                    strokeWidth: 3,
                    tip: true
                }),
                Plot.dot(chartData, {
                    x: "millis",
                    y: "satellites",
                    fill: "#6366f1",
                    r: 4,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (satellitesPlotRef.current && satellitesChartRef.current && satellitesChartRef.current.contains(satellitesPlotRef.current)) {
            satellitesChartRef.current.removeChild(satellitesPlotRef.current);
        }

        // Add new plot
        if (satellitesChartRef.current) {
            satellitesChartRef.current.appendChild(satellitesPlot);
            satellitesPlotRef.current = satellitesPlot;
        }

        return () => {
            if (satellitesPlotRef.current && satellitesChartRef.current && satellitesChartRef.current.contains(satellitesPlotRef.current)) {
                satellitesChartRef.current.removeChild(satellitesPlotRef.current);
            }
            satellitesPlotRef.current = null;
        };
    }, [chartData]);

    return (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
                Flight Dynamics (FIDO)
            </h3>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* GPS Position Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">GPS Position</h4>
                    <div ref={gpsPosChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for FIDO data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-red-500"></div>
                            Latitude
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-green-500"></div>
                            Longitude
                        </span>
                    </div>
                </div>

                {/* Altitude Comparison Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Altitude Comparison (m)</h4>
                    <div ref={altitudeChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for FIDO data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-blue-500"></div>
                            GPS Altitude
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-amber-500"></div>
                            Barometric Altitude
                        </span>
                    </div>
                </div>

                {/* Speed and Heading Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Speed & Heading</h4>
                    <div ref={speedHeadingChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for FIDO data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-purple-500"></div>
                            Speed (km/h)
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-pink-500"></div>
                            Heading (°)
                        </span>
                    </div>
                </div>

                {/* Atmospheric Conditions Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Atmospheric Conditions</h4>
                    <div ref={atmosphericChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for FIDO data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-amber-500"></div>
                            Temperature (°C)
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-cyan-500"></div>
                            Pressure (Pa)
                        </span>
                    </div>
                </div>

                {/* Satellites Count Chart */}
                <div className="bg-white p-4 rounded border lg:col-span-2">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Satellite Count</h4>
                    <div ref={satellitesChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for FIDO data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-indigo-500"></div>
                            GPS Satellites
                        </span>
                    </div>
                </div>
            </div>

            {/* Latest Values Display */}
            {latestData && (
                <div className="mt-6 bg-white p-4 rounded border">
                    <h4 className="text-md font-medium mb-3">Latest Sensor Values</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">GPS Position</p>
                            <p className="font-mono">Lat: {latestData.data.latitude?.toFixed(6) || 'N/A'}</p>
                            <p className="font-mono">Lon: {latestData.data.longitude?.toFixed(6) || 'N/A'}</p>
                            <p className="font-mono">GPS Alt: {latestData.data.gps_altitude?.toFixed(1) || 'N/A'}m</p>
                            <p className="font-mono">Satellites: {latestData.data.satellites || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Motion</p>
                            <p className="font-mono">Speed: {latestData.data.speed?.toFixed(2) || 'N/A'} km/h</p>
                            <p className="font-mono">Heading: {latestData.data.heading?.toFixed(1) || 'N/A'}°</p>
                            <p className="font-mono">Baro Alt: {latestData.data.baro_altitude?.toFixed(1) || 'N/A'}m</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Atmospheric</p>
                            <p className="font-mono">Temp: {latestData.data.bmp_temp?.toFixed(1) || 'N/A'}°C</p>
                            <p className="font-mono">Pressure: {latestData.data.pressure?.toFixed(0) || 'N/A'} Pa</p>
                            <p className="text-gray-600">Timestamp</p>
                            <p className="font-mono text-xs">{new Date(latestData.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FIDO;
