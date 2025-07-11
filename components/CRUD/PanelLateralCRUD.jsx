export function PanelLateralCRUD({ config, onModeSelect }) {
  return (
    <div className="w-full md:w-1/3 bg-blue-800 p-8 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-blue-300 mb-2">{config.title}</h1>
      <p className="text-white mb-8">{config.subtitle}</p>
      
      <div className="flex flex-col gap-4 w-full">
        <button 
          onClick={() => onModeSelect('new')}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded w-full"
        >
          {config.buttons.new}
        </button>
        <button 
          onClick={() => onModeSelect('edit')}
          className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded w-full"
        >
          {config.buttons.edit}
        </button>
      </div>
    </div>
  );
}