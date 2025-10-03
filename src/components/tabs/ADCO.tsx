import { useDataAccumulator } from '@/hooks/useDataAccumulator';
import * as Plot from '@observablehq/plot';
import React, { useEffect, useRef } from 'react';

interface ADCOProps {
    telemetryData: any;
}

const ADCO: React.FC<ADCOProps> = ({ telemetryData }) => {
    const { dataPoints, latestData, chartData, dataCount } = useDataAccumulator(telemetryData, {
        maxDataPoints: 100,
        shouldAdd: (data) => {
            console.log('ADCO shouldAdd check:', data);
            // Check if ICM20948 fields exist at root level
            const hasICMData = data && data.icm20948_accx_g !== undefined;
            console.log('ADCO hasICMData:', hasICMData);
            return hasICMData;
        },
        extractData: (data) => {
            console.log('ADCO extractData - ICM20948 fields:', {
                accx: data.icm20948_accx_g,
                accy: data.icm20948_accy_g,
                accz: data.icm20948_accz_g
            });
            return {
                // Use millis from telemetry data for x-axis
                millis: data.millis || Date.now(),
                // Acceleration (g) - direct from root level
                accx: data.icm20948_accx_g,
                accy: data.icm20948_accy_g,
                accz: data.icm20948_accz_g,
                // Gyroscope (deg/s) - direct from root level
                gyrox: data.icm20948_gyrox_deg_s,
                gyroy: data.icm20948_gyroy_deg_s,
                gyroz: data.icm20948_gyroz_deg_s,
                // Magnetometer (μT) - direct from root level
                magx: data.icm20948_magx_ut,
                magy: data.icm20948_magy_ut,
                magz: data.icm20948_magz_ut,
                // Temperature (°C) - direct from root level
                temp: data.icm20948_temp_c
            };
        }
    });

    // Refs for chart containers
    const accChartRef = useRef<HTMLDivElement>(null);
    const gyroChartRef = useRef<HTMLDivElement>(null);
    const magChartRef = useRef<HTMLDivElement>(null);
    const tempChartRef = useRef<HTMLDivElement>(null);

    // Refs to track current plots for safe cleanup
    const accPlotRef = useRef<HTMLElement | null>(null);
    const gyroPlotRef = useRef<HTMLElement | null>(null);
    const magPlotRef = useRef<HTMLElement | null>(null);
    const tempPlotRef = useRef<HTMLElement | null>(null);

    // Create acceleration chart
    useEffect(() => {
        if (!accChartRef.current || chartData.length === 0) return;

        console.log('ADCO Chart Data:', chartData.length, chartData);

        // Calculate time domain based on actual millis values from the data
        const millisValues = chartData.map(d => d.millis).filter(m => m !== undefined);

        let timeDomain: [number, number];
        if (millisValues.length > 0) {
            const minMillis = Math.min(...millisValues);
            const maxMillis = Math.max(...millisValues);
            // Add 5% padding on each side for better visualization
            const padding = (maxMillis - minMillis) * 0.05 || 1000;
            timeDomain = [minMillis - padding, maxMillis + padding];
        } else {
            // Fallback if no millis values
            timeDomain = [0, 60000];
        }

        const accPlot = Plot.plot({
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
                label: "↑ Acceleration (g)",
                grid: true
            },
            marks: [
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "accx",
                    stroke: "#ef4444",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "accy",
                    stroke: "#22c55e",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "accz",
                    stroke: "#3b82f6",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.ruleY([0], { stroke: "#666", strokeDasharray: "2,2" })
            ]
        });

        // Clear existing plot safely
        if (accPlotRef.current && accChartRef.current && accChartRef.current.contains(accPlotRef.current)) {
            accChartRef.current.removeChild(accPlotRef.current);
        }

        // Add new plot
        if (accChartRef.current) {
            accChartRef.current.appendChild(accPlot);
            accPlotRef.current = accPlot;
        }

        return () => {
            if (accPlotRef.current && accChartRef.current && accChartRef.current.contains(accPlotRef.current)) {
                accChartRef.current.removeChild(accPlotRef.current);
            }
            accPlotRef.current = null;
        };
    }, [chartData]);

    // Create gyroscope chart
    useEffect(() => {
        if (!gyroChartRef.current || chartData.length === 0) return;

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

        const gyroPlot = Plot.plot({
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
                label: "↑ Angular Velocity (deg/s)",
                grid: true
            },
            marks: [
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "gyrox",
                    stroke: "#ef4444",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "gyroy",
                    stroke: "#22c55e",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "gyroz",
                    stroke: "#3b82f6",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.ruleY([0], { stroke: "#666", strokeDasharray: "2,2" })
            ]
        });

        // Clear existing plot safely
        if (gyroPlotRef.current && gyroChartRef.current && gyroChartRef.current.contains(gyroPlotRef.current)) {
            gyroChartRef.current.removeChild(gyroPlotRef.current);
        }

        // Add new plot
        if (gyroChartRef.current) {
            gyroChartRef.current.appendChild(gyroPlot);
            gyroPlotRef.current = gyroPlot;
        }

        return () => {
            if (gyroPlotRef.current && gyroChartRef.current && gyroChartRef.current.contains(gyroPlotRef.current)) {
                gyroChartRef.current.removeChild(gyroPlotRef.current);
            }
            gyroPlotRef.current = null;
        };
    }, [chartData]);

    // Create magnetometer chart
    useEffect(() => {
        if (!magChartRef.current || chartData.length === 0) return;

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

        const magPlot = Plot.plot({
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
                label: "↑ Magnetic Field (μT)",
                grid: true
            },
            marks: [
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "magx",
                    stroke: "#ef4444",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "magy",
                    stroke: "#22c55e",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "magz",
                    stroke: "#3b82f6",
                    strokeWidth: 2,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (magPlotRef.current && magChartRef.current && magChartRef.current.contains(magPlotRef.current)) {
            magChartRef.current.removeChild(magPlotRef.current);
        }

        // Add new plot
        if (magChartRef.current) {
            magChartRef.current.appendChild(magPlot);
            magPlotRef.current = magPlot;
        }

        return () => {
            if (magPlotRef.current && magChartRef.current && magChartRef.current.contains(magPlotRef.current)) {
                magChartRef.current.removeChild(magPlotRef.current);
            }
            magPlotRef.current = null;
        };
    }, [chartData]);

    // Create temperature chart
    useEffect(() => {
        if (!tempChartRef.current || chartData.length === 0) return;

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

        const tempPlot = Plot.plot({
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
                label: "↑ Temperature (°C)",
                grid: true
            },
            marks: [
                Plot.areaY(chartData, {
                    x: "millis",
                    y: "temp",
                    fill: "#f59e0b",
                    fillOpacity: 0.1
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "temp",
                    stroke: "#f59e0b",
                    strokeWidth: 3,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (tempPlotRef.current && tempChartRef.current && tempChartRef.current.contains(tempPlotRef.current)) {
            tempChartRef.current.removeChild(tempPlotRef.current);
        }

        // Add new plot
        if (tempChartRef.current) {
            tempChartRef.current.appendChild(tempPlot);
            tempPlotRef.current = tempPlot;
        }

        return () => {
            if (tempPlotRef.current && tempChartRef.current && tempChartRef.current.contains(tempPlotRef.current)) {
                tempChartRef.current.removeChild(tempPlotRef.current);
            }
            tempPlotRef.current = null;
        };
    }, [chartData]);

    return (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
                Attitude Determination and Control (ICM20948)
            </h3>

            {/* Debug Info */}
            {telemetryData && (
                <div className="mb-4 bg-yellow-50 p-3 rounded border border-yellow-200">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug: Raw Telemetry Data</h4>
                    <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(telemetryData, null, 2)}
                    </pre>
                </div>
            )}

            {/* Chart Data Debug */}
            <div className="mb-4 bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Debug: Chart Data ({chartData.length} points)</h4>
                <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(chartData.slice(-3), null, 2)}
                </pre>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Data Points</p>
                    <p className="text-2xl font-bold text-green-600">{dataCount}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Latest Update</p>
                    <p className="text-sm font-medium">
                        {latestData ? new Date(latestData.timestamp).toLocaleTimeString() : 'No data'}
                    </p>
                </div>
                <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Current Temp</p>
                    <p className="text-lg font-bold text-orange-600">
                        {latestData?.data?.temp?.toFixed(1) || 'N/A'}°C
                    </p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Acceleration Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Acceleration (g)</h4>
                    <div ref={accChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for ADCO data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-red-500"></div>
                            X-Axis
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-green-500"></div>
                            Y-Axis
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-blue-500"></div>
                            Z-Axis
                        </span>
                    </div>
                </div>

                {/* Gyroscope Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Gyroscope (deg/s)</h4>
                    <div ref={gyroChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for ADCO data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-red-500"></div>
                            X-Axis
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-green-500"></div>
                            Y-Axis
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-blue-500"></div>
                            Z-Axis
                        </span>
                    </div>
                </div>

                {/* Magnetometer Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Magnetometer (μT)</h4>
                    <div ref={magChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for ADCO data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-red-500"></div>
                            X-Axis
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-green-500"></div>
                            Y-Axis
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-blue-500"></div>
                            Z-Axis
                        </span>
                    </div>
                </div>

                {/* Temperature Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Temperature (°C)</h4>
                    <div ref={tempChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for ADCO data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-amber-500"></div>
                            Temperature
                        </span>
                    </div>
                </div>
            </div>

            {/* Latest Values Display */}
            {latestData && (
                <div className="mt-6 bg-white p-4 rounded border">
                    <h4 className="text-md font-medium mb-3">Latest Sensor Values</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Acceleration (g)</p>
                            <p className="font-mono">X: {latestData.data.accx?.toFixed(3)}</p>
                            <p className="font-mono">Y: {latestData.data.accy?.toFixed(3)}</p>
                            <p className="font-mono">Z: {latestData.data.accz?.toFixed(3)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Gyroscope (deg/s)</p>
                            <p className="font-mono">X: {latestData.data.gyrox?.toFixed(2)}</p>
                            <p className="font-mono">Y: {latestData.data.gyroy?.toFixed(2)}</p>
                            <p className="font-mono">Z: {latestData.data.gyroz?.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Magnetometer (μT)</p>
                            <p className="font-mono">X: {latestData.data.magx?.toFixed(1)}</p>
                            <p className="font-mono">Y: {latestData.data.magy?.toFixed(1)}</p>
                            <p className="font-mono">Z: {latestData.data.magz?.toFixed(1)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Temperature</p>
                            <p className="font-mono">{latestData.data.temp?.toFixed(1)}°C</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Timestamp</p>
                            <p className="font-mono text-xs">{new Date(latestData.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ADCO;