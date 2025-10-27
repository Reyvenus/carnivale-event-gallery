import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';

const AdminPanel = () => {
  const [pendingMessages, setPendingMessages] = useState([]);
  const [approvedMessages, setApprovedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'approved'
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_APP_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    
    // Mensajes pendientes
    const { data: pending, error: pendingError } = await supabase
      .from(import.meta.env.VITE_APP_TABLE_NAME)
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false });

    // Mensajes aprobados
    const { data: approved, error: approvedError } = await supabase
      .from(import.meta.env.VITE_APP_TABLE_NAME)
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (!pendingError) setPendingMessages(pending || []);
    if (!approvedError) setApprovedMessages(approved || []);
    
    setLoading(false);
  };

  const handleApprove = async (id) => {
    const { error } = await supabase
      .from(import.meta.env.VITE_APP_TABLE_NAME)
      .update({ approved: true })
      .eq('id', id);

    if (!error) {
      fetchMessages();
    } else {
      alert('Error al aprobar: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este mensaje?')) return;

    const { error } = await supabase
      .from(import.meta.env.VITE_APP_TABLE_NAME)
      .delete()
      .eq('id', id);

    if (!error) {
      fetchMessages();
    } else {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const handleUnapprove = async (id) => {
    const { error } = await supabase
      .from(import.meta.env.VITE_APP_TABLE_NAME)
      .update({ approved: false })
      .eq('id', id);

    if (!error) {
      fetchMessages();
    } else {
      alert('Error al rechazar: ' + error.message);
    }
  };

  useEffect(() => {
    // Verificar si ya está autenticado
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
      // Auto-refresh cada 30 segundos
      const interval = setInterval(fetchMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            🔐 Admin Panel
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-white/90 text-sm font-medium block mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                📋 Panel de Administración
              </h1>
              <p className="text-white/60 text-sm">
                Gestiona los mensajes de tu boda
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchMessages}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all text-sm font-medium"
              >
                🔄 Actualizar
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('adminAuth');
                  setIsAuthenticated(false);
                }}
                className="px-4 py-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 mb-6 border border-white/20 flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-white text-black'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            ⏳ Pendientes ({pendingMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'approved'
                ? 'bg-white text-black'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            ✅ Aprobados ({approvedMessages.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
            <div className="text-white/60 text-lg">⏳ Cargando mensajes...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'pending' && (
              <>
                {pendingMessages.length === 0 ? (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
                    <div className="text-6xl mb-4">🎉</div>
                    <div className="text-white text-xl font-semibold mb-2">
                      ¡Todo al día!
                    </div>
                    <div className="text-white/60">
                      No hay mensajes pendientes por revisar
                    </div>
                  </div>
                ) : (
                  pendingMessages.map((msg) => (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                      onApprove={handleApprove}
                      onDelete={handleDelete}
                      isPending={true}
                    />
                  ))
                )}
              </>
            )}

            {activeTab === 'approved' && (
              <>
                {approvedMessages.length === 0 ? (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
                    <div className="text-6xl mb-4">📭</div>
                    <div className="text-white text-xl font-semibold mb-2">
                      Sin mensajes aprobados
                    </div>
                    <div className="text-white/60">
                      Aún no has aprobado ningún mensaje
                    </div>
                  </div>
                ) : (
                  approvedMessages.map((msg) => (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                      onUnapprove={handleUnapprove}
                      onDelete={handleDelete}
                      isPending={false}
                    />
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MessageCard = ({ message, onApprove, onDelete, onUnapprove, isPending }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            width={48}
            height={48}
            src="/images/face.png"
            style={{
              backgroundColor: message.color || '#3B82F6',
              minWidth: 48,
              minHeight: 48,
            }}
            className="rounded-full shadow-lg"
            alt="Avatar"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg break-words">{message.name}</h3>
              <p className="text-white/50 text-xs">
                📅 {formatDate(message.created_at)}
              </p>
            </div>
            {isPending ? (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-200 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
                ⏳ Pendiente
              </span>
            ) : (
              <span className="px-3 py-1 bg-green-500/20 text-green-200 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
                ✅ Aprobado
              </span>
            )}
          </div>

          <p className="text-white/80 text-sm leading-relaxed mb-4 break-words whitespace-pre-wrap">
            &ldquo;{message.message}&rdquo;
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {isPending ? (
              <button
                onClick={() => onApprove(message.id)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium"
              >
                ✅ Aprobar
              </button>
            ) : (
              <button
                onClick={() => onUnapprove(message.id)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all text-sm font-medium"
              >
                ⏳ Rechazar
              </button>
            )}
            <button
              onClick={() => onDelete(message.id)}
              className="px-4 py-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
