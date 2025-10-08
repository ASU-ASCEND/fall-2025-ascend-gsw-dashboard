import { useDataAccumulator } from '@/hooks/useDataAccumulator';
import * as Plot from '@observablehq/plot';
import React, { useEffect, useRef } from 'react';

interface METProps {
    telemetryData: any;
}

const MET: React.FC<METProps> = ({ telemetryData }) => {
    const { latestData, chartData } = useDataAccumulator(telemetryData, {
        maxDataPoints: 100,
        shouldAdd: (data) => {
            // Check if any MET outdoor sensor fields exist at root level
            const hasMETData = data && (
                data.tmp117_o_temp_o_c !== undefined ||
                data.shtc3_o_temp_o_c !== undefined ||
                data.shtc3_o_rel_hum_o !== undefined ||
                data.scd40_o_co2_conc_o_ppm !== undefined ||
                data.scd40_o_temp_o_c !== undefined ||
                data.scd40_o_rel_hum_o !== undefined ||
                data.ens160_o_aqi_o !== undefined ||
                data.ens160_o_tvoc_o_ppb !== undefined ||
                data.ens160_o_eco2_o_ppm !== undefined ||
                data.ozone_conc_ppb !== undefined ||
                data.uv_sensor_uva2_nm !== undefined ||
                data.uv_sensor_uvb2_nm !== undefined ||
                data.uv_sensor_uvc2_nm !== undefined
            );
            return hasMETData;
        },
        extractData: (data) => {
            return {
                // Use millis from telemetry data for x-axis
                millis: data.millis || Date.now(),
                // Temperature sensors (°C) - outdoor
                t_tmp117_o: data.tmp117_o_temp_o_c,
                t_shtc3_o: data.shtc3_o_temp_o_c,
                t_scd40_o: data.scd40_o_temp_o_c,
                // Humidity sensors (%) - outdoor
                h_shtc3_o: data.shtc3_o_rel_hum_o,
                h_scd40_o: data.scd40_o_rel_hum_o,
                // CO2 sensors (ppm) - outdoor
                co2_ppm_o: data.scd40_o_co2_conc_o_ppm,
                eco2_ppm_o: data.ens160_o_eco2_o_ppm,
                // Air quality sensors - outdoor
                aqi_o: data.ens160_o_aqi_o,
                tvoc_ppb_o: data.ens160_o_tvoc_o_ppb,
                // Unique outdoor sensors
                ozone_ppb: data.ozone_conc_ppb,
                uva: data.uv_sensor_uva2_nm,
                uvb: data.uv_sensor_uvb2_nm,
                uvc: data.uv_sensor_uvc2_nm
            };
        }
    });

    // Refs for chart containers
    const tempChartRef = useRef<HTMLDivElement>(null);
    const humidityChartRef = useRef<HTMLDivElement>(null);
    const co2ChartRef = useRef<HTMLDivElement>(null);
    const tvocChartRef = useRef<HTMLDivElement>(null);
    const aqiChartRef = useRef<HTMLDivElement>(null);
    const ozoneChartRef = useRef<HTMLDivElement>(null);
    const uvChartRef = useRef<HTMLDivElement>(null);

    // Refs to track current plots for safe cleanup
    const tempPlotRef = useRef<Element | null>(null);
    const humidityPlotRef = useRef<Element | null>(null);
    const co2PlotRef = useRef<Element | null>(null);
    const tvocPlotRef = useRef<Element | null>(null);
    const aqiPlotRef = useRef<Element | null>(null);
    const ozonePlotRef = useRef<Element | null>(null);
    const uvPlotRef = useRef<Element | null>(null);

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
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "t_tmp117_o",
                    stroke: "#ef4444",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "t_shtc3_o",
                    stroke: "#22c55e",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "t_scd40_o",
                    stroke: "#3b82f6",
                    strokeWidth: 2,
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

    // Create humidity chart
    useEffect(() => {
        if (!humidityChartRef.current || chartData.length === 0) return;

        const timeDomain = calculateTimeDomain();

        const humidityPlot = Plot.plot({
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
                label: "↑ Relative Humidity (%)",
                grid: true
            },
            marks: [
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "h_shtc3_o",
                    stroke: "#8b5cf6",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "h_scd40_o",
                    stroke: "#f59e0b",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.ruleY([0, 100], { stroke: "#666", strokeDasharray: "2,2" })
            ]
        });

        // Clear existing plot safely
        if (humidityPlotRef.current && humidityChartRef.current && humidityChartRef.current.contains(humidityPlotRef.current)) {
            humidityChartRef.current.removeChild(humidityPlotRef.current);
        }

        // Add new plot
        if (humidityChartRef.current) {
            humidityChartRef.current.appendChild(humidityPlot);
            humidityPlotRef.current = humidityPlot;
        }

        return () => {
            if (humidityPlotRef.current && humidityChartRef.current && humidityChartRef.current.contains(humidityPlotRef.current)) {
                humidityChartRef.current.removeChild(humidityPlotRef.current);
            }
            humidityPlotRef.current = null;
        };
    }, [chartData]);

    // Create CO2 chart
    useEffect(() => {
        if (!co2ChartRef.current || chartData.length === 0) return;

        const timeDomain = calculateTimeDomain();

        const co2Plot = Plot.plot({
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
                label: "↑ CO₂ Concentration (ppm)",
                grid: true
            },
            marks: [
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "co2_ppm_o",
                    stroke: "#06b6d4",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "eco2_ppm_o",
                    stroke: "#10b981",
                    strokeWidth: 2,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (co2PlotRef.current && co2ChartRef.current && co2ChartRef.current.contains(co2PlotRef.current)) {
            co2ChartRef.current.removeChild(co2PlotRef.current);
        }

        // Add new plot
        if (co2ChartRef.current) {
            co2ChartRef.current.appendChild(co2Plot);
            co2PlotRef.current = co2Plot;
        }

        return () => {
            if (co2PlotRef.current && co2ChartRef.current && co2ChartRef.current.contains(co2PlotRef.current)) {
                co2ChartRef.current.removeChild(co2PlotRef.current);
            }
            co2PlotRef.current = null;
        };
    }, [chartData]);

    // Create TVOC chart
    useEffect(() => {
        if (!tvocChartRef.current || chartData.length === 0) return;

        const timeDomain = calculateTimeDomain();

        const tvocPlot = Plot.plot({
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
                label: "↑ TVOC (ppb)",
                grid: true
            },
            marks: [
                Plot.areaY(chartData, {
                    x: "millis",
                    y: "tvoc_ppb_o",
                    fill: "#f97316",
                    fillOpacity: 0.1
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "tvoc_ppb_o",
                    stroke: "#f97316",
                    strokeWidth: 3,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (tvocPlotRef.current && tvocChartRef.current && tvocChartRef.current.contains(tvocPlotRef.current)) {
            tvocChartRef.current.removeChild(tvocPlotRef.current);
        }

        // Add new plot
        if (tvocChartRef.current) {
            tvocChartRef.current.appendChild(tvocPlot);
            tvocPlotRef.current = tvocPlot;
        }

        return () => {
            if (tvocPlotRef.current && tvocChartRef.current && tvocChartRef.current.contains(tvocPlotRef.current)) {
                tvocChartRef.current.removeChild(tvocPlotRef.current);
            }
            tvocPlotRef.current = null;
        };
    }, [chartData]);

    // Create AQI chart
    useEffect(() => {
        if (!aqiChartRef.current || chartData.length === 0) return;

        const timeDomain = calculateTimeDomain();

        const aqiPlot = Plot.plot({
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
                label: "↑ Air Quality Index",
                grid: true
            },
            marks: [
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "aqi_o",
                    stroke: "#dc2626",
                    strokeWidth: 3,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (aqiPlotRef.current && aqiChartRef.current && aqiChartRef.current.contains(aqiPlotRef.current)) {
            aqiChartRef.current.removeChild(aqiPlotRef.current);
        }

        // Add new plot
        if (aqiChartRef.current) {
            aqiChartRef.current.appendChild(aqiPlot);
            aqiPlotRef.current = aqiPlot;
        }

        return () => {
            if (aqiPlotRef.current && aqiChartRef.current && aqiChartRef.current.contains(aqiPlotRef.current)) {
                aqiChartRef.current.removeChild(aqiPlotRef.current);
            }
            aqiPlotRef.current = null;
        };
    }, [chartData]);

    // Create ozone chart
    useEffect(() => {
        if (!ozoneChartRef.current || chartData.length === 0) return;

        const timeDomain = calculateTimeDomain();

        const ozonePlot = Plot.plot({
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
                label: "↑ Ozone Concentration (ppb)",
                grid: true
            },
            marks: [
                Plot.areaY(chartData, {
                    x: "millis",
                    y: "ozone_ppb",
                    fill: "#14b8a6",
                    fillOpacity: 0.1
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "ozone_ppb",
                    stroke: "#14b8a6",
                    strokeWidth: 3,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (ozonePlotRef.current && ozoneChartRef.current && ozoneChartRef.current.contains(ozonePlotRef.current)) {
            ozoneChartRef.current.removeChild(ozonePlotRef.current);
        }

        // Add new plot
        if (ozoneChartRef.current) {
            ozoneChartRef.current.appendChild(ozonePlot);
            ozonePlotRef.current = ozonePlot;
        }

        return () => {
            if (ozonePlotRef.current && ozoneChartRef.current && ozoneChartRef.current.contains(ozonePlotRef.current)) {
                ozoneChartRef.current.removeChild(ozonePlotRef.current);
            }
            ozonePlotRef.current = null;
        };
    }, [chartData]);

    // Create UV sensor chart
    useEffect(() => {
        if (!uvChartRef.current || chartData.length === 0) return;

        const timeDomain = calculateTimeDomain();

        const uvPlot = Plot.plot({
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
                label: "↑ UV Intensity (nm)",
                grid: true
            },
            marks: [
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "uva",
                    stroke: "#8b5cf6",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "uvb",
                    stroke: "#a855f7",
                    strokeWidth: 2,
                    tip: true
                }),
                Plot.lineY(chartData, {
                    x: "millis",
                    y: "uvc",
                    stroke: "#c084fc",
                    strokeWidth: 2,
                    tip: true
                })
            ]
        });

        // Clear existing plot safely
        if (uvPlotRef.current && uvChartRef.current && uvChartRef.current.contains(uvPlotRef.current)) {
            uvChartRef.current.removeChild(uvPlotRef.current);
        }

        // Add new plot
        if (uvChartRef.current) {
            uvChartRef.current.appendChild(uvPlot);
            uvPlotRef.current = uvPlot;
        }

        return () => {
            if (uvPlotRef.current && uvChartRef.current && uvChartRef.current.contains(uvPlotRef.current)) {
                uvChartRef.current.removeChild(uvPlotRef.current);
            }
            uvPlotRef.current = null;
        };
    }, [chartData]);

    return (
        <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
                Meteorology (Outdoor Sensors)
            </h3>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Temperature Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Temperature (°C)</h4>
                    <div ref={tempChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for MET data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-red-500"></div>
                            TMP117
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-green-500"></div>
                            SHTC3
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-blue-500"></div>
                            SCD40
                        </span>
                    </div>
                </div>

                {/* Humidity Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Relative Humidity (%)</h4>
                    <div ref={humidityChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for MET data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-purple-500"></div>
                            SHTC3
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-amber-500"></div>
                            SCD40
                        </span>
                    </div>
                </div>

                {/* CO2 Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">CO₂ Concentration (ppm)</h4>
                    <div ref={co2ChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for MET data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-cyan-500"></div>
                            SCD40
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-emerald-500"></div>
                            ENS160
                        </span>
                    </div>
                </div>

                {/* TVOC Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">TVOC (ppb)</h4>
                    <div ref={tvocChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for MET data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-orange-500"></div>
                            TVOC
                        </span>
                    </div>
                </div>

                {/* AQI Chart */}
                <div className="bg-white p-4 rounded border lg:col-span-2">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Air Quality Index</h4>
                    <div ref={aqiChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for MET data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-red-600"></div>
                            AQI
                        </span>
                    </div>
                </div>

                {/* Ozone Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Ozone Concentration (ppb)</h4>
                    <div ref={ozoneChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for MET data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-teal-500"></div>
                            Ozone
                        </span>
                    </div>
                </div>

                {/* UV Sensor Chart */}
                <div className="bg-white p-4 rounded border">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">UV Intensity (nm)</h4>
                    <div ref={uvChartRef} className="w-full">
                        {chartData.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Waiting for MET data...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-purple-500"></div>
                            UVA
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-violet-500"></div>
                            UVB
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-fuchsia-500"></div>
                            UVC
                        </span>
                    </div>
                </div>
            </div>

            {/* Latest Values Display */}
            {latestData && (
                <div className="mt-6 bg-white p-4 rounded border">
                    <h4 className="text-md font-medium mb-3">Latest Outdoor Sensor Values</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Temperature (°C)</p>
                            <p className="font-mono">TMP117: {latestData.data.t_tmp117_o?.toFixed(1) || 'N/A'}</p>
                            <p className="font-mono">SHTC3: {latestData.data.t_shtc3_o?.toFixed(1) || 'N/A'}</p>
                            <p className="font-mono">SCD40: {latestData.data.t_scd40_o?.toFixed(1) || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Humidity (%)</p>
                            <p className="font-mono">SHTC3: {latestData.data.h_shtc3_o?.toFixed(1) || 'N/A'}</p>
                            <p className="font-mono">SCD40: {latestData.data.h_scd40_o?.toFixed(1) || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">CO₂ (ppm)</p>
                            <p className="font-mono">SCD40: {latestData.data.co2_ppm_o?.toFixed(0) || 'N/A'}</p>
                            <p className="font-mono">ENS160: {latestData.data.eco2_ppm_o?.toFixed(0) || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Air Quality</p>
                            <p className="font-mono">TVOC: {latestData.data.tvoc_ppb_o?.toFixed(0) || 'N/A'} ppb</p>
                            <p className="font-mono">AQI: {latestData.data.aqi_o || 'N/A'}</p>
                            <p className="font-mono">Ozone: {latestData.data.ozone_ppb?.toFixed(0) || 'N/A'} ppb</p>
                        </div>
                        <div>
                            <p className="text-gray-600">UV Sensors</p>
                            <p className="font-mono">UVA: {latestData.data.uva?.toFixed(1) || 'N/A'} nm</p>
                            <p className="font-mono">UVB: {latestData.data.uvb?.toFixed(1) || 'N/A'} nm</p>
                            <p className="font-mono">UVC: {latestData.data.uvc?.toFixed(1) || 'N/A'} nm</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MET;
