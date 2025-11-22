import { Film } from 'lucide-react';

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[#22c1c3] border-t-transparent rounded-full animate-spin"></div>
        <Film className="w-8 h-8 text-[#22c1c3] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-[#9AA7B3] text-lg">Loading your recommendations...</p>
    </div>
  );
}

export default Loader;
