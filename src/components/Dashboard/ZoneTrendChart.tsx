import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

const ZoneTrendChart = ({ data }: any) => {

    const formatted =
        data?.[0]?.trends?.map((item: any) => ({
            date: item.date,
            orders: item.order_count
        })) || [];

    return (<div className="bg-white rounded-lg p-6 border">


        <h3 className="text-lg font-semibold mb-4">
            Zone Orders Trend
        </h3>

        <ResponsiveContainer width="100%" height={300}>

            <BarChart data={formatted}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis />

                <Tooltip />

                <Bar
                    dataKey="orders"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                />

            </BarChart>

        </ResponsiveContainer>

    </div>


    );
};

export default ZoneTrendChart;
