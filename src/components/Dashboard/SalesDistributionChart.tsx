import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

const SalesDistributionChart = ({ data }: any) => {

    const formatted = data.map((item: any) => ({
        name: item.name,
        percentage: item.percentage
    }));

    return (<div className="bg-white rounded-lg p-6 border">


        <h3 className="text-lg font-semibold mb-4">
            Sales Distribution
        </h3>

        <ResponsiveContainer width="100%" height={300}>

            <BarChart data={formatted}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                    dataKey="percentage"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                />

            </BarChart>

        </ResponsiveContainer>

    </div>


    );
};

export default SalesDistributionChart;
