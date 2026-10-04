import { useState } from "react";

type Status = "pass" | "fail" | "pending";
type Check = { status: Status; detail?: string };

const modules = [
    ["sensors", "I²C sensor initialization"],
    ["storage", "SD storage"],
    ["boards", "Board health"],
    ["communication", "CAN communication"],
] as const;

type Id = (typeof modules)[number][0];
type Results = Partial<Record<Id, Check>>;

function parseResults(value: unknown): Results {
    if (!value || typeof value !== "object" || !("checks" in value)) {
        throw new Error("Missing checks");
    }

    const checks = value.checks;
    if (!checks || typeof checks !== "object") {
        throw new Error("Invalid checks");
    }

    const results: Results = {};

    for (const [id] of modules) {
        const item = (checks as Record<string, unknown>)[id];
        if (item === undefined) continue;

        if (
            !item || typeof item !== "object" ||
            !("status" in item) ||
            !["pass", "fail", "pending"].includes(String(item.status))
        ) {
            throw new Error("Invalid result");
        }

        results[id] = {
            status: item.status as Status,
            detail:
                "detail" in item && typeof item.detail === "string"
                    ? item.detail
                    : undefined,
        };
    }

    return results;
}

export default function VerificationPanel() {
    const [checks, setChecks] = useState<Results>({});
    const [running, setRunning] = useState(false);
    const [updated, setUpdated] = useState<number | null>(null);
    const [error, setError] = useState("");

    const base = (
        import.meta.env.VITE_VERIFICATION_BASE_URL ||
        window.location.origin
    ).replace(/\/$/, "");

    async function runChecks() {
        setRunning(true);
        setChecks({});
        setUpdated(null);
        setError("");

        try {
            const response = await fetch(`${base}/verification/run`, {
                method: "POST",
                signal: AbortSignal.timeout(30000),
            });

            if (!response.ok) throw new Error("Request failed");

            setChecks(parseResults(await response.json()));
            setUpdated(Date.now());
        } catch {
            setError(
                "Check did not complete. Confirm Pico Wi-Fi and API address."
            );
        } finally {
            setRunning(false);
        }
    }

    return (
        <section className="min-w-0 rounded-lg border bg-white p-4">
            <h2 className="text-lg font-semibold">
                Ground Verification · Pico 2 W
            </h2>
            <p className="mt-1 text-xs text-gray-500">
                One-time results from your last check.
            </p>

            <div className="mt-4 divide-y">
                {modules.map(([id, label]) => {
                    const result = checks[id];
                    const status = result?.status;
                    const color =
                        status === "pass" ? "text-green-700" :
                        status === "fail" ? "text-red-700" :
                        "text-gray-500";

                    return (
                        <div key={id} className="py-3">
                            <div className="flex justify-between gap-3">
                                <span className="text-sm font-medium">
                                    {label}
                                </span>
                                <span className={`text-xs font-bold ${color}`}>
                                    {status === "pending" ? "Not tested" :
                                     status ? status.toUpperCase() :
                                     "Awaiting check"}
                                </span>
                            </div>
                            <p className="mt-1 break-words text-xs text-gray-500">
                                {result?.detail}
                            </p>
                        </div>
                    );
                })}
            </div>

            {error && (
                <p role="alert" className="mt-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                    {updated
                        ? `Last check: ${new Date(updated).toLocaleTimeString()}`
                        : "No completed check"}
                </p>
                <button
                    type="button"
                    disabled={running}
                    onClick={runChecks}
                    className="rounded bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                    {running ? "Checking…" : "Run verification"}
                </button>
            </div>
        </section>
    );
}