import Chart from "react-apexcharts";

const chartConfig = {
  type: "pie",
  width: 500,
  height: 500,
  series: [44, 55, 13, 43, 22],
  options: {
    chart: {
      toolbar: {
        show: false,
      },
    },
    title: {
      show: "",
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#ffffff", "#ff8f00", "#00897b", "#1e88e5", "#d81b60"],
    legend: {
      show: false,
    },
  },
};

export default function Example() {
  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center pt-10">
      {/* Extended Rectangle */}
      <div className="bg-gray-800 rounded-2xl p-10 shadow-lg w-[750px] h-[550px] flex justify-start items-center absolute top-[100px] left-[40px]">
        <Chart {...chartConfig} />
      </div>
    </div>
  );
}
