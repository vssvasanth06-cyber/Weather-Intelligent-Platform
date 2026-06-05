interface Props {
    connected: boolean;
}

function ConnectionStatus({ connected }: Props) {
    return (
        <div className="flex items-center gap-2 text-sm font-semibold">
            <span
                className={`w-3 h-3 rounded-full ${
                    connected
                        ? "bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.6)] animate-pulse"
                        : "bg-red-500"
                }`}
            />
            <span className={connected ? "text-green-400" : "text-red-400"}>
                {connected ? "LIVE" : "RECONNECTING..."}
            </span>
        </div>
    );
}

export default ConnectionStatus;
