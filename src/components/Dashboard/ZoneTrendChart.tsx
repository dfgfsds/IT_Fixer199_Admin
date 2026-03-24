// import {
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     Tooltip,
//     ResponsiveContainer,
//     CartesianGrid
// } from "recharts";

// const ZoneTrendChart = ({ data }: any) => {

//     const formatted =
//         data?.[0]?.trends?.map((item: any) => ({
//             date: item.date,
//             orders: item.order_count
//         })) || [];

//     return (<div className="bg-white rounded-lg p-6 border">


//         <h3 className="text-lg font-semibold mb-4">
//             Zone Orders Trend
//         </h3>

//         <ResponsiveContainer width="100%" height={300}>

//             <BarChart data={formatted}>

//                 <CartesianGrid strokeDasharray="3 3" />

//                 <XAxis dataKey="date" />

//                 <YAxis />

//                 <Tooltip />

//                 <Bar
//                     dataKey="orders"
//                     fill="#f97316"
//                     radius={[4, 4, 0, 0]}
//                 />

//             </BarChart>

//         </ResponsiveContainer>

//     </div>


//     );
// };

// export default ZoneTrendChart;


import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend
} from "recharts";

const ZoneTrendChart = ({ data }: any) => {

    const formatted =
        data?.[0]?.trends?.map((item: any) => ({
            date: item.date,
            orders: item.order_count,
            revenue: item.revenue_amount
        })) || [];

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short"
        });

    return (
        <div className="bg-white rounded-lg p-6 border">

            <h3 className="text-lg font-semibold mb-4">
                Zone Orders & Revenue Trend
            </h3>

            <ResponsiveContainer width="100%" height={300}>

                <BarChart data={formatted}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                    />

                    {/* LEFT → Orders */}
                    <YAxis
                        yAxisId="left"
                        allowDecimals={false}
                    />

                    {/* RIGHT → Revenue */}
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                    />

                    <Tooltip
                        formatter={(value: any, name: any) => [
                            name === "revenue" ? `₹${value}` : value,
                            name === "revenue" ? "Revenue" : "Orders"
                        ]}
                        labelFormatter={(label) =>
                            `Date: ${formatDate(label)}`
                        }
                    />

                    <Legend />

                    {/* Orders */}
                    <Bar
                        yAxisId="left"
                        dataKey="orders"
                        fill="#f97316"
                        name="Orders"
                        radius={[4, 4, 0, 0]}
                    />

                    {/* Revenue */}
                    <Bar
                        yAxisId="right"
                        dataKey="revenue"
                        fill="#22c55e"
                        name="Revenue"
                        radius={[4, 4, 0, 0]}
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>
    );
};

export default ZoneTrendChart;