import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

const OrdersBarChart = ({ data }: any) => {

    const formatted = data.map((item: any) => ({
        date: item.date,
        orders: item.count
    }));

    return (<div className="bg-white rounded-lg p-6 border">


        <h3 className="text-lg font-semibold mb-4">
            Orders Trend
        </h3>

        <ResponsiveContainer width="100%" height={300}>

            <BarChart data={formatted}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis />

                <Tooltip />

                <Bar
                    dataKey="orders"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                />

            </BarChart>

        </ResponsiveContainer>

    </div>


    );
};

export default OrdersBarChart;
