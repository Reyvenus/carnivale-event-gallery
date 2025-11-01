import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';

const AdminPanel = () => {
  const [pendingMessages, setPendingMessages] = useState([]);
  const [approvedMessages, setApprovedMessages] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('guests'); // 'pending', 'approved', or 'guests'
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConfirmed, setFilterConfirmed] = useState('all'); // 'all', 'confirmed', 'pending'
  const [guestForm, setGuestForm] = useState({
    first_name: '',
    last_name: '',
    nickname: '',
    guest_code: '',
    cost_per_person: 0,
    confirmed: false,
    num_companions: 0,
    notes: ''
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_APP_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const fetchMessages = async (silent = false) => {
    // Solo mostrar loading en la carga inicial
    if (!silent) {
      setLoading(true);
    }
    
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
    
    if (!silent) {
      setLoading(false);
    }
  };

  const fetchGuests = async (silent = false) => {
    // Solo mostrar loading en la carga inicial
    if (!silent) {
      setLoading(true);
    }
    
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setGuests(data || []);
    } else {
      console.error('Error fetching guests:', error);
    }
    
    if (!silent) {
      setLoading(false);
    }
  };

  const handleSaveGuest = async (e) => {
    e.preventDefault();
    
    if (editingGuest) {
      // Actualizar invitado existente
      const { error } = await supabase
        .from('guests')
        .update(guestForm)
        .eq('id', editingGuest.id);

      if (!error) {
        alert('✅ Invitado actualizado correctamente');
        setShowGuestForm(false);
        setEditingGuest(null);
        resetGuestForm();
        fetchGuests();
      } else {
        alert('❌ Error al actualizar: ' + error.message);
      }
    } else {
      // Crear nuevo invitado
      const { error } = await supabase
        .from('guests')
        .insert([guestForm]);

      if (!error) {
        alert('✅ Invitado agregado correctamente');
        setShowGuestForm(false);
        resetGuestForm();
        fetchGuests();
      } else {
        alert('❌ Error al agregar: ' + error.message);
      }
    }
  };

  const handleEditGuest = (guest) => {
    setEditingGuest(guest);
    setGuestForm({
      first_name: guest.first_name,
      last_name: guest.last_name,
      nickname: guest.nickname || '',
      guest_code: guest.guest_code,
      cost_per_person: guest.cost_per_person,
      confirmed: guest.confirmed,
      num_companions: guest.num_companions || 0,
      notes: guest.notes || ''
    });
    setShowGuestForm(true);
  };

  const handleDeleteGuest = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este invitado?')) return;

    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('✅ Invitado eliminado');
      fetchGuests();
    } else {
      alert('❌ Error al eliminar: ' + error.message);
    }
  };

  const resetGuestForm = () => {
    setGuestForm({
      first_name: '',
      last_name: '',
      nickname: '',
      guest_code: '',
      cost_per_person: 0,
      confirmed: false,
      num_companions: 0,
      notes: ''
    });
  };

  // Filtrar y buscar invitados
  const filteredGuests = guests.filter(guest => {
    // Filtro de búsqueda
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      guest.first_name?.toLowerCase().includes(searchLower) ||
      guest.last_name?.toLowerCase().includes(searchLower) ||
      guest.nickname?.toLowerCase().includes(searchLower) ||
      guest.guest_code?.toLowerCase().includes(searchLower);

    // Filtro de confirmación
    const matchesConfirmed = 
      filterConfirmed === 'all' ||
      (filterConfirmed === 'confirmed' && guest.confirmed) ||
      (filterConfirmed === 'pending' && !guest.confirmed);

    return matchesSearch && matchesConfirmed;
  });

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
      // Carga inicial con loading
      fetchMessages(false);
      fetchGuests(false);
      
      // Auto-refresh cada 30 segundos (silencioso, sin loading)
      const interval = setInterval(() => {
        fetchMessages(true);  // true = modo silencioso
        fetchGuests(true);    // true = modo silencioso
      }, 30000);
      
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
                onClick={() => {
                  fetchMessages(false);
                  fetchGuests(false);
                }}
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
            onClick={() => setActiveTab('guests')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'guests'
                ? 'bg-white text-black'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            👥 Invitados ({guests.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-white text-black'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            ⏳ Mensajes ({pendingMessages.length})
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
            <div className="text-white/60 text-lg">⏳ Cargando...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Guests Tab */}
            {activeTab === 'guests' && (
              <>
                {/* Add Guest Button & View Toggle */}
                <div className="flex justify-between items-center gap-4 mb-4 flex-wrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        viewMode === 'table'
                          ? 'bg-white text-black'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      📊 Tabla
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        viewMode === 'cards'
                          ? 'bg-white text-black'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      🎴 Tarjetas
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setShowGuestForm(!showGuestForm);
                      setEditingGuest(null);
                      resetGuestForm();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold shadow-lg"
                  >
                    {showGuestForm ? '❌ Cancelar' : '➕ Agregar Invitado'}
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-white/70 text-xs font-medium block mb-2">
                        🔍 Buscar invitado
                      </label>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre, apellido, nickname o código..."
                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                    </div>
                    <div>
                      <label className="text-white/70 text-xs font-medium block mb-2">
                        🎯 Filtrar por estado
                      </label>
                      <select
                        value={filterConfirmed}
                        onChange={(e) => setFilterConfirmed(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <option value="all">Todos</option>
                        <option value="confirmed">✅ Confirmados</option>
                        <option value="pending">⏳ Pendientes</option>
                      </select>
                    </div>
                  </div>
                  {(searchTerm || filterConfirmed !== 'all') && (
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-white/60 text-sm">
                        Mostrando {filteredGuests.length} de {guests.length} invitados
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilterConfirmed('all');
                        }}
                        className="text-xs text-white/60 hover:text-white underline"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  )}
                </div>

                {/* Guest Form */}
                {showGuestForm && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-4">
                    <h3 className="text-xl font-bold text-white mb-4">
                      {editingGuest ? '✏️ Editar Invitado' : '➕ Nuevo Invitado'}
                    </h3>
                    <form onSubmit={handleSaveGuest} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-white/90 text-sm font-medium block mb-2">
                            Nombre *
                          </label>
                          <input
                            type="text"
                            value={guestForm.first_name}
                            onChange={(e) => setGuestForm({...guestForm, first_name: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-white/90 text-sm font-medium block mb-2">
                            Apellido *
                          </label>
                          <input
                            type="text"
                            value={guestForm.last_name}
                            onChange={(e) => setGuestForm({...guestForm, last_name: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-white/90 text-sm font-medium block mb-2">
                            Nickname
                          </label>
                          <input
                            type="text"
                            value={guestForm.nickname}
                            onChange={(e) => setGuestForm({...guestForm, nickname: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                          />
                        </div>
                        <div>
                          <label className="text-white/90 text-sm font-medium block mb-2">
                            Código Invitado *
                          </label>
                          <input
                            type="text"
                            value={guestForm.guest_code}
                            onChange={(e) => setGuestForm({...guestForm, guest_code: e.target.value.toUpperCase()})}
                            placeholder="INV001"
                            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-white/90 text-sm font-medium block mb-2">
                            Costo por Persona (ARS)
                          </label>
                          <input
                            type="number"
                            value={guestForm.cost_per_person}
                            onChange={(e) => setGuestForm({...guestForm, cost_per_person: parseFloat(e.target.value)})}
                            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                          />
                        </div>
                        <div>
                          <label className="text-white/90 text-sm font-medium block mb-2">
                            Nº Acompañantes
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={guestForm.num_companions}
                            onChange={(e) => setGuestForm({...guestForm, num_companions: parseInt(e.target.value)})}
                            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-white/90 text-sm font-medium block mb-2">
                          Notas
                        </label>
                        <textarea
                          value={guestForm.notes}
                          onChange={(e) => setGuestForm({...guestForm, notes: e.target.value})}
                          rows="3"
                          className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="confirmado"
                          checked={guestForm.confirmed}
                          onChange={(e) => setGuestForm({...guestForm, confirmed: e.target.checked})}
                          className="w-5 h-5 rounded"
                        />
                        <label htmlFor="confirmado" className="text-white/90 text-sm font-medium">
                          ✅ Confirmado
                        </label>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
                        >
                          {editingGuest ? '💾 Guardar Cambios' : '➕ Agregar Invitado'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowGuestForm(false);
                            setEditingGuest(null);
                            resetGuestForm();
                          }}
                          className="px-6 py-3 bg-gray-500/20 text-white rounded-lg hover:bg-gray-500/30 transition-all font-semibold"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Guest Stats */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 mb-4">
                  <div className="flex items-center justify-around gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/30 flex items-center justify-center text-3xl border border-blue-400/30">
                        👥
                      </div>
                      <div className="text-white text-2xl font-bold">{guests.length}</div>
                      <div className="text-blue-200 text-xs font-medium mt-1">Invitados</div>
                    </div>
                    
                    <div className="w-px h-16 bg-white/20"></div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-green-500/30 to-green-600/30 flex items-center justify-center text-3xl border border-green-400/30">
                        ✅
                      </div>
                      <div className="text-white text-2xl font-bold">
                        {guests.filter(g => g.confirmed).length}
                      </div>
                      <div className="text-green-200 text-xs font-medium mt-1">Confirmados</div>
                    </div>
                    
                    <div className="w-px h-16 bg-white/20"></div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/30 flex items-center justify-center text-3xl border border-purple-400/30">
                        🎉
                      </div>
                      <div className="text-white text-2xl font-bold">
                        {guests.reduce((sum, g) => sum + 1 + (g.num_companions || 0), 0)}
                      </div>
                      <div className="text-purple-200 text-xs font-medium mt-1">Personas</div>
                    </div>
                  </div>
                </div>

                {/* Guests List */}
                {filteredGuests.length === 0 ? (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
                    <div className="text-6xl mb-4">
                      {guests.length === 0 ? '👥' : '🔍'}
                    </div>
                    <div className="text-white text-xl font-semibold mb-2">
                      {guests.length === 0 ? 'Sin invitados' : 'No se encontraron resultados'}
                    </div>
                    <div className="text-white/60">
                      {guests.length === 0 
                        ? 'Agrega tu primer invitado para comenzar'
                        : 'Intenta con otros términos de búsqueda o filtros'}
                    </div>
                  </div>
                ) : viewMode === 'table' ? (
                  /* Table View */
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                              Invitado
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                              Código
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-white/90 uppercase tracking-wider">
                              Estado
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-white/90 uppercase tracking-wider">
                              Personas
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-white/90 uppercase tracking-wider">
                              Costo Total
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-white/90 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {filteredGuests.map((guest) => {
                            const totalPersonas = 1 + (guest.num_companions || 0);
                            const costoTotal = (guest.cost_per_person || 0) * totalPersonas;
                            
                            return (
                              <tr key={guest.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3">
                                  <div>
                                    <div className="text-white font-medium">
                                      {guest.first_name} {guest.last_name}
                                    </div>
                                    {guest.nickname && (
                                      <div className="text-white/60 text-sm">
                                        ({guest.nickname})
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-mono text-white/80 text-sm">
                                    {guest.guest_code}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {guest.confirmed ? (
                                    <span className="inline-flex px-2 py-1 bg-green-500/20 text-green-200 text-xs font-medium rounded-full">
                                      ✅ Confirmado
                                    </span>
                                  ) : (
                                    <span className="inline-flex px-2 py-1 bg-yellow-500/20 text-yellow-200 text-xs font-medium rounded-full">
                                      ⏳ Pendiente
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="text-white font-semibold">
                                    {totalPersonas}
                                  </div>
                                  {guest.num_companions > 0 && (
                                    <div className="text-white/60 text-xs">
                                      (+{guest.num_companions} acomp.)
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="text-green-400 font-bold">
                                    ${costoTotal.toLocaleString('es-AR')}
                                  </div>
                                  <div className="text-white/60 text-xs">
                                    ${guest.cost_per_person?.toLocaleString('es-AR')} c/u
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleEditGuest(guest)}
                                      className="p-2 bg-blue-500/20 text-blue-200 rounded-lg hover:bg-blue-500/30 transition-all"
                                      title="Editar"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => {
                                        const url = `${window.location.origin}?code=${encodeURIComponent(guest.guest_code)}`;
                                        navigator.clipboard.writeText(url);
                                        alert('✅ URL copiada!');
                                      }}
                                      className="p-2 bg-purple-500/20 text-purple-200 rounded-lg hover:bg-purple-500/30 transition-all"
                                      title="Copiar Link"
                                    >
                                      🔗
                                    </button>
                                    <button
                                      onClick={() => handleDeleteGuest(guest.id)}
                                      className="p-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition-all"
                                      title="Eliminar"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Cards View */
                  <div className="space-y-3">
                    {filteredGuests.map((guest) => (
                      <GuestCard
                        key={guest.id}
                        guest={guest}
                        onEdit={handleEditGuest}
                        onDelete={handleDeleteGuest}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

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

const GuestCard = ({ guest, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalPersonas = 1 + (guest.num_companions || 0);
  const costoTotal = (guest.cost_per_person || 0) * totalPersonas;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
      <div className="flex items-start gap-4">
        {/* Avatar/Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
            👤
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg break-words">
                {guest.first_name} {guest.last_name}
                {guest.nickname && (
                  <span className="text-white/60 text-sm font-normal ml-2">
                    ({guest.nickname})
                  </span>
                )}
              </h3>
              <p className="text-white/50 text-xs mt-1">
                📋 Código: <span className="font-mono text-white/70">{guest.guest_code}</span>
                {' | '}
                📅 {formatDate(guest.created_at)}
              </p>
            </div>
            {guest.confirmed ? (
              <span className="px-3 py-1 bg-green-500/20 text-green-200 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
                ✅ Confirmado
              </span>
            ) : (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-200 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
                ⏳ Pendiente
              </span>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-white/50 text-xs mb-1">Personas</div>
              <div className="text-white font-semibold">{totalPersonas}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-white/50 text-xs mb-1">Acompañantes</div>
              <div className="text-white font-semibold">{guest.num_companions || 0}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-white/50 text-xs mb-1">Costo/Persona</div>
              <div className="text-white font-semibold">${guest.cost_per_person?.toLocaleString('es-AR') || 0}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-white/50 text-xs mb-1">Total</div>
              <div className="text-green-400 font-bold">${costoTotal.toLocaleString('es-AR')}</div>
            </div>
          </div>

          {/* Notes */}
          {guest.notes && (
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3 mb-4">
              <div className="text-blue-200 text-xs font-medium mb-1">📝 Notas:</div>
              <p className="text-white/80 text-sm whitespace-pre-wrap">{guest.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onEdit(guest)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium"
            >
              ✏️ Editar
            </button>
            <button
              onClick={() => onDelete(guest.id)}
              className="px-4 py-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium"
            >
              🗑️ Eliminar
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}?code=${encodeURIComponent(guest.guest_code)}`;
                navigator.clipboard.writeText(url);
                alert('✅ URL de invitación copiada al portapapeles!');
              }}
              className="px-4 py-2 bg-purple-500/20 text-purple-200 rounded-lg hover:bg-purple-500/30 transition-all text-sm font-medium"
            >
              🔗 Copiar Link
            </button>
          </div>
        </div>
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
