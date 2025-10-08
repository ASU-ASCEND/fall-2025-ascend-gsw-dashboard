import { useDataAccumulator } from '@/hooks/useDataAccumulator';
import * as Plot from '@observablehq/plot';
import React, { useEffect, useRef } from 'react';

interface SYSProps {
    telemetryData: any;
}

const SYS: React.FC<SYSProps> = ({ telemetryData }) => {
    const { latestData, chartData } = useDataAccumulator(telemetryData, {
        maxDataPoints: 100,
        shouldAdd: (data) => {
            // Check if INA260 or picotemp fields exist at root level
            const hasSYSData = data && (
                data.ina260_current_ma !== undefined ||
                data.ina260_voltage_mv !== undefined ||
                data.ina260_power_mw !== undefined ||
                data.picotemp_temp_c !== undefined
            );
            return hasSYSData;
        },
        extractData: (data) => {
            return {
                // Use millis from telemetry data for x-axis
                millis: data.millis || Date.now(),
                // INA260 Power monitoring (mA, mV, mW)
                current_ma: data.ina260_current_ma,
                voltage_mv: data.ina260_voltage_mv,
                power_mw: data.ina260_power_mw,
                // Temperature sensor (°C)
                temp_c: data.picotemp_temp_c,
                // RTC timestamp data (for display only, not charted)
                year: data.pcf8523_year,
                month: data.pcf8523_month,
                day: data.pcf8523_day,
                hour: data.pcf8523_hour,
                minute: data.pcf8523_minute,
                second: data.pcf8523_second
            };
        }
    });

    // Refs for chart containers
    const powerChartRef = useRef<HTMLDivElement>(null);
    const currentChartRef = useRef<HTMLDivElement>(null);
    const voltageChartRef = useRef<HTMLDivElement>(null);
    const tempChartRef = useRef<HTMLDivElement>(null);

    // Refs to track current plots for safe cleanup
    const powerPlotRef = useRef<Element | null>(null);
    const currentPlotRef = useRef<Element | null>(null);
    const voltagePlotRef = useRef<Element | null>(null);
    const tempPlotRef = useRef<Element | null>(null);

    // Helper function to calculate time domain
    const calculateTimeDomain = () => {
        const millisValues = chartData.map(d => d.millis).filter(m => m !== undefined);
        if (millisValues.length > 0) {
            const minMillis = Math.min(...millisValues);
            const maxMillis = Math.max(...millisValues);
            const padding = (maxMillis - minMillis) * 0.05 || 1000;
            return [minMillis - padding, maxMillis + padding] as [number, number];
        } else {
            return [0, 60000] as [number, number];
        }
    };

    // Create power chart
    useEffect(() => {
        if (!powerChartRef.current || chartData.length === 0) return;

        const timeDomain = calculateTimeDomain();

        const powerPlot = Plot.plot({
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
                label: "↑ Power Consumption (mW)",
                grid: true
            },
            marks: [
                Plot.areaY(chartData, {
                    x: "millis",
                    y: "power_mw",
                    fill: "#f59e0b",
                    fillOpacity: 0.1
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "power_mw",
                    stroke: "#f59e0b",
                    strokeWidth: 3,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (powerPlotRef.current && powerChartRef.current && powerChartRef.current.contains(powerPlotRef.current)) {
            powerChartRef.current.removeChild(powerPlotRef.current);
        }

        // Add new plot
        if (powerChartRef.current) {
            powerChartRef.current.appendChild(powerPlot);
            powerPlotRef.current = powerPlot;
        }

        return () => {
            if (powerPlotRef.current && powerChartRef.current && powerChartRef.current.contains(powerPlotRef.current)) {
                powerChartRef.current.removeChild(powerPlotRef.current);
            }
            powerPlotRef.current = null;
        };
    }, [chartData]);

    // Create current chart
    useEffect(() => {
        if (!currentChartRef.current || chartData.length === 0) return;

        const timeDomain = calculateTimeDomain();

        const currentPlot = Plot.plot({
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
                label: "↑ Current Draw (mA)",
                grid: true
            },
            marks: [
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "current_ma",
                    stroke: "#ef4444",
                    strokeWidth: 2,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (currentPlotRef.current && currentChartRef.current && currentChartRef.current.contains(currentPlotRef.current)) {
            currentChartRef.current.removeChild(currentPlotRef.current);
        }

        // Add new plot
        if (currentChartRef.current) {
            currentChartRef.current.appendChild(currentPlot);
            currentPlotRef.current = currentPlot;
        }

        return () => {
            if (currentPlotRef.current && currentChartRef.current && currentChartRef.current.contains(currentPlotRef.current)) {
                currentChartRef.current.removeChild(currentPlotRef.current);
            }
            currentPlotRef.current = null;
        };
    }, [chartData]);

    // Create voltage chart
    useEffect(() => {
        if (!voltageChartRef.current || chartData.length === 0) return;

        const timeDomain = calculateTimeDomain();

        const voltagePlot = Plot.plot({
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
                label: "↑ Voltage (mV)",
                grid: true
            },
            marks: [
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "voltage_mv",
                    stroke: "#3b82f6",
                    strokeWidth: 2,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (voltagePlotRef.current && voltageChartRef.current && voltageChartRef.current.contains(voltagePlotRef.current)) {
            voltageChartRef.current.removeChild(voltagePlotRef.current);
        }

        // Add new plot
        if (voltageChartRef.current) {
            voltageChartRef.current.appendChild(voltagePlot);
            voltagePlotRef.current = voltagePlot;
        }

        return () => {
            if (voltagePlotRef.current && voltageChartRef.current && voltageChartRef.current.contains(voltagePlotRef.current)) {
                voltageChartRef.current.removeChild(voltagePlotRef.current);
            }
            voltagePlotRef.current = null;
        };
    }, [chartData]);

    // Create temperature chart
    useEffect(() => {
        if (!tempChartRef.current || chartData.length === 0) return;

        const timeDomain = calculateTimeDomain();

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
                    y: "temp_c",
                    fill: "#f97316",
                    fillOpacity: 0.1
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "temp_c",
                    stroke: "#f97316",
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
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
                System Operations
            </h3>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Power Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Power Consumption (mW)</h4>
                    <div ref={powerChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for SYS data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-amber-500"></div>
                            Power
                        </span>
                    </div>
                </div>

                {/* Current Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Current Draw (mA)</h4>
                    <div ref={currentChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for SYS data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-red-500"></div>
                            Current
                        </span>
                    </div>
                </div>

                {/* Voltage Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Voltage (mV)</h4>
                    <div ref={voltageChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for SYS data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-blue-500"></div>
                            Voltage
                        </span>
                    </div>
                </div>

                {/* Temperature Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Temperature (°C)</h4>
                    <div ref={tempChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for SYS data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-orange-500"></div>
                            Temperature
                        </span>
                    </div>
                </div>
            </div>

            {/* Latest Values Display */}
            {latestData && (
                <div className="mt-6 bg-white p-4 rounded border">
                    <h4 className="text-md font-medium mb-3">Latest System Values</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Power Monitoring</p>
                            <p className="font-mono">Current: {latestData.data.current_ma?.toFixed(2) || 'N/A'} mA</p>
                            <p className="font-mono">Voltage: {latestData.data.voltage_mv?.toFixed(1) || 'N/A'} mV</p>
                            <p className="font-mono">Power: {latestData.data.power_mw?.toFixed(1) || 'N/A'} mW</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Temperature</p>
                            <p className="font-mono">{latestData.data.temp_c?.toFixed(1) || 'N/A'}°C</p>
                        </div>
                        <div>
                            <p className="text-gray-600">RTC Timestamp</p>
                            <p className="font-mono">
                                {latestData.data.year && latestData.data.month && latestData.data.day && latestData.data.hour !== undefined && latestData.data.minute !== undefined && latestData.data.second !== undefined
                                    ? `${latestData.data.year}-${String(latestData.data.month).padStart(2, '0')}-${String(latestData.data.day).padStart(2, '0')} ${String(latestData.data.hour).padStart(2, '0')}:${String(latestData.data.minute).padStart(2, '0')}:${String(latestData.data.second).padStart(2, '0')}`
                                    : 'N/A'
                                }
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">Data Update</p>
                            <p className="font-mono text-xs">{new Date(latestData.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SYS;
