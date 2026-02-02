import { useNavigate } from 'react-router-dom';


function App() {

  const navigate = useNavigate();
  console.log('App rendering');

  return (
    <div className="min-h-screen text-white p-10 border-2 border-white">
      <h1 className="text-4xl font-bold mb-4">App Works!</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => navigate('/media')}
      >
        Go to Media
      </button>
    </div>
  )
}

export default App;
