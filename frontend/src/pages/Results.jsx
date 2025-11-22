import { useLocation } from "react-router-dom";

function Results() {
  const { state } = useLocation();

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Your Recommendations</h1>

      {state?.movies?.map((m, i) => (
        <div key={i} className="bg-gray-900 p-4 rounded mb-3">
          {m}
        </div>
      ))}
    </div>
  );
}

export default Results;
