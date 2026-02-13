export function StatCard({ title, value, icon: Icon, trend, color = "teal" }) {
    const colorClasses = {
        teal: "from-teal-500 to-cyan-500",
        green: "from-green-500 to-emerald-500",
        orange: "from-orange-500 to-amber-500",
        blue: "from-blue-500 to-indigo-500",
        red: "from-red-500 to-pink-500",
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                            {trend}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}
                    >
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                )}
            </div>
        </div>
    );
}
