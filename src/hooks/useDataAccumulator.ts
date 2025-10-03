import { useCallback, useEffect, useRef, useState } from 'react';

interface DataPoint {
    timestamp: number;
    data: any;
}

interface UseDataAccumulatorOptions {
    maxDataPoints?: number;
    extractData?: (telemetryData: any) => any;
    shouldAdd?: (telemetryData: any) => boolean;
}

export const useDataAccumulator = (
    telemetryData: any,
    options: UseDataAccumulatorOptions = {}
) => {
    const {
        maxDataPoints = 100,
        extractData = (data) => data,
        shouldAdd = () => true
    } = options;

    const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
    // Track the last processed millis value to avoid duplicates
    const lastMillisRef = useRef<number | null>(null);

    useEffect(() => {
        console.log('useDataAccumulator: Received telemetry data', telemetryData);

        if (!telemetryData) {
            console.log('useDataAccumulator: No telemetry data');
            return;
        }

        const shouldAddResult = shouldAdd(telemetryData);
        console.log('useDataAccumulator: shouldAdd result', shouldAddResult);

        if (!shouldAddResult) {
            console.log('useDataAccumulator: Data filtered out by shouldAdd');
            return;
        }

        // Check if this is a duplicate by comparing millis value
        const currentMillis = telemetryData.millis;
        if (currentMillis !== undefined && currentMillis === lastMillisRef.current) {
            console.log('useDataAccumulator: Skipping duplicate millis value:', currentMillis);
            return;
        }

        console.log('useDataAccumulator: Processing telemetry data', telemetryData);

        const extractedData = extractData(telemetryData);
        console.log('useDataAccumulator: Extracted data', extractedData);

        const newDataPoint: DataPoint = {
            timestamp: Date.now(),
            data: extractedData
        };

        // Update last millis
        if (currentMillis !== undefined) {
            lastMillisRef.current = currentMillis;
        }

        setDataPoints(prev => {
            const newData = [...prev, newDataPoint];
            console.log('useDataAccumulator: Adding data point, total points:', newData.length);
            // Keep only the last maxDataPoints
            const finalData = newData.length > maxDataPoints
                ? newData.slice(-maxDataPoints)
                : newData;
            console.log('useDataAccumulator: Final data points count:', finalData.length);
            return finalData;
        });
    }, [telemetryData, maxDataPoints, extractData, shouldAdd]);

    const clearData = useCallback(() => {
        setDataPoints([]);
        lastMillisRef.current = null;
    }, []);

    const getLatestData = useCallback(() => {
        return dataPoints.length > 0 ? dataPoints[dataPoints.length - 1] : null;
    }, [dataPoints]);

    const getChartData = useCallback(() => {
        return dataPoints.map(point => ({
            x: point.data.millis || point.timestamp, // Use millis if available, fallback to timestamp
            y: point.data,
            ...point.data
        }));
    }, [dataPoints]);

    return {
        dataPoints,
        latestData: getLatestData(),
        chartData: getChartData(),
        dataCount: dataPoints.length,
        clearData
    };
};
