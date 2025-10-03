import { useDataAccumulator } from '@/hooks/useDataAccumulator';
import React from 'react';

interface FIDOProps {
    telemetryData: any;
}

const FIDO: React.FC<FIDOProps> = ({ telemetryData }) => {
    const { dataPoints, latestData, chartData, dataCount } = useDataAccumulator(telemetryData, {
        maxDataPoints: 40,
        shouldAdd: (data) => data.fido !== undefined,
        extractData: (data) => data.fido
    });

    return (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
                Flight Dynamics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Data Points Collected</p>
                    <p className="text-2xl font-bold text-purple-600">{dataCount}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Latest Update</p>
                    <p className="text-sm font-medium">
                        {latestData ? new Date(latestData.timestamp).toLocaleTimeString() : 'No data'}
                    </p>
                </div>
            </div>

            {latestData && (
                <div className="bg-white p-3 rounded border mb-4">
                    <p className="text-sm text-gray-600 mb-2">Latest FIDO Data:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(latestData.data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default FIDO;
