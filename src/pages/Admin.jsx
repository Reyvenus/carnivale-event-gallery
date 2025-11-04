import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConfirmed, setFilterConfirmed] = useState('all'); // 'all', 'confirmed', 'pending'
  const [filterGuestFrom, setFilterGuestFrom] = useState('all'); // 'all', 'wife', 'husband'
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(false);
  const [previewGuest, setPreviewGuest] = useState(null);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [guestPayments, setGuestPayments] = useState([]);
  const [allGuestPayments, setAllGuestPayments] = useState({}); // Objeto con { guest_id: total_pagado }
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [guestForm, setGuestForm] = useState({
    first_name: '',
    last_name: '',
    nickname: '',
    guest_code: '',
    cost_per_person: 0,
    confirmed: false,
    num_guests: 0,
    notes: '',
    guest_from: 'wife' // Valor por defecto
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

  const fetchAllGuestPayments = useCallback(async (guestsList) => {
    if (!guestsList || guestsList.length === 0) {
      setAllGuestPayments({});
      return;
    }

    const { data, error } = await supabase
      .from('guest_payments')
      .select('guest_id, amount');

    if (!error && data) {
      // Sumar todos los pagos por guest_id
      const paymentsByGuest = data.reduce((acc, payment) => {
        if (!acc[payment.guest_id]) {
          acc[payment.guest_id] = 0;
        }
        acc[payment.guest_id] += parseFloat(payment.amount);
        return acc;
      }, {});
      setAllGuestPayments(paymentsByGuest);
    } else {
      console.error('Error fetching all payments:', error);
    }
  }, []);

  const fetchGuests = useCallback(async (silent = false) => {
    // Solo mostrar loading en la carga inicial
    if (!silent) {
      setLoading(true);
    }
    
    const { data, error } = await supabase
      .from(import.meta.env.VITE_GUESTS_TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setGuests(data || []);
      // Cargar pagos de todos los invitados
      fetchAllGuestPayments(data || []);
    } else {
      console.error('Error fetching guests:', error);
    }
    
    if (!silent) {
      setLoading(false);
    }
  }, [fetchAllGuestPayments]);

  const generateGuestCode = (firstName, lastName) => {
    // Obtener las 2 primeras letras del nombre en mayúsculas
    const prefix = firstName.substring(0, 2).toUpperCase();
    
    // Crear un string con el nombre completo
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    
    // Generar un hash simple pero único basado en el nombre completo y timestamp
    let hash = 0;
    const str = fullName + Date.now();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convertir a hexadecimal y tomar 10 caracteres
    const hexHash = Math.abs(hash).toString(16).toUpperCase().padStart(10, '0').substring(0, 10);
    
    return `${prefix}-${hexHash}`;
  };

  const handleSaveGuest = async (e) => {
    e.preventDefault();
    
    if (editingGuest) {
      // Actualizar invitado existente
      const { error } = await supabase
        .from(import.meta.env.VITE_GUESTS_TABLE_NAME)
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
      // Crear nuevo invitado - generar guest_code automáticamente
      const guestCode = generateGuestCode(guestForm.first_name, guestForm.last_name);
      const newGuest = {
        ...guestForm,
        guest_code: guestCode
      };
      
      const { error } = await supabase
        .from(import.meta.env.VITE_GUESTS_TABLE_NAME)
        .insert([newGuest]);

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
      num_guests: guest.num_guests || 0,
      notes: guest.notes || '',
      guest_from: guest.guest_from || 'wife'
    });
    setShowGuestForm(true);
  };

  const handleDeleteGuest = async (id) => {
    const { error } = await supabase
      .from(import.meta.env.VITE_GUESTS_TABLE_NAME)
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
      num_guests: 0,
      notes: '',
      guest_from: 'wife'
    });
  };

  const handleSendWhatsApp = (guest) => {
    setPreviewGuest(guest);
    setShowWhatsAppPreview(true);
  };

  const confirmSendWhatsApp = () => {
    if (!previewGuest) return;
    const url = `${window.location.origin}?code=${encodeURIComponent(previewGuest.guest_code)}`;
    const guestName = previewGuest.nickname || previewGuest.first_name;
    const message = `¡Hola ${guestName}! 👋\n\n¡Nos casamos! 💍💐\n\nTe invitamos a nuestra boda. Aquí está tu invitación personalizada:\n\n${url}\n\n¡Esperamos verte allí! 🎉`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsAppPreview(false);
    setPreviewGuest(null);
  };

  // Funciones de pagos
  const handleOpenPayments = (guest) => {
    setSelectedGuest(guest);
    setShowPaymentsModal(true);
    // Cargar pagos de forma asíncrona sin bloquear la apertura del modal
    fetchGuestPayments(guest.id);
  };

  const fetchGuestPayments = async (guestId) => {
    const { data, error } = await supabase
      .from('guest_payments')
      .select('*')
      .eq('guest_id', guestId)
      .order('payment_date', { ascending: false });

    if (!error) {
      setGuestPayments(data || []);
    } else {
      console.error('Error fetching payments:', error);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedGuest) return;

    const { error } = await supabase
      .from('guest_payments')
      .insert([{
        guest_id: selectedGuest.id,
        amount: parseFloat(paymentForm.amount),
        payment_date: paymentForm.payment_date,
        notes: paymentForm.notes
      }]);

    if (!error) {
      alert('✅ Pago agregado correctamente');
      setShowAddPayment(false);
      setPaymentForm({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      await fetchGuestPayments(selectedGuest.id);
      // Recargar todos los pagos para actualizar la tabla
      await fetchAllGuestPayments(guests);
    } else {
      alert('❌ Error al agregar pago: ' + error.message);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!confirm('¿Estás seguro de eliminar este pago?')) return;

    const { error } = await supabase
      .from('guest_payments')
      .delete()
      .eq('id', paymentId);

    if (!error) {
      alert('✅ Pago eliminado');
      await fetchGuestPayments(selectedGuest.id);
      // Recargar todos los pagos para actualizar la tabla
      await fetchAllGuestPayments(guests);
    } else {
      alert('❌ Error al eliminar: ' + error.message);
    }
  };

  const getTotalPaid = (payments) => {
    return payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
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

    // Filtro de lado (wife/husband)
    const matchesGuestFrom = 
      filterGuestFrom === 'all' ||
      guest.guest_from === filterGuestFrom;

    return matchesSearch && matchesConfirmed && matchesGuestFrom;
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
  }, [isAuthenticated, fetchGuests]);

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
        {/* Header - Title and User Menu in one row */}
        <div className="px-6 py-5 mb-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-white/20 flex items-center justify-center text-xl backdrop-blur-sm">
              💍
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                Panel de Administración
              </h1>
              <p className="text-white/50 text-[11px] font-medium">
                Gestión de invitados y mensajes
              </p>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="group p-2.5 bg-white/10 backdrop-blur-lg text-white rounded-full hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 shadow-lg relative"
              title="Menú de usuario"
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {/* Online indicator */}
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></span>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop to close menu */}
                <div 
                  className="fixed inset-0 z-[9998]" 
                  onClick={() => setShowUserMenu(false)}
                />
                
                {/* Menu */}
                <div 
                  className="absolute right-0 mt-3 w-56 bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl overflow-hidden z-[9999]"
                  style={{ animation: 'slideDown 0.2s ease-out' }}
                >
                  <style>{`
                    @keyframes slideDown {
                      from {
                        opacity: 0;
                        transform: translateY(-10px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                  `}</style>
                  
                  {/* Header */}
                  <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-lg">👤</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold leading-tight">Administrador</p>
                        <p className="text-white/50 text-xs mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          En línea
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        localStorage.removeItem('adminAuth');
                        setIsAuthenticated(false);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-3 py-2.5 rounded-lg text-left text-white/80 hover:bg-red-500/20 hover:text-red-200 transition-all flex items-center gap-3 text-sm group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Cerrar sesión</p>
                        <p className="text-[10px] text-white/40 group-hover:text-red-200/60 transition-colors">Salir del panel</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-0.5 border-b border-white/20">
            <button
              onClick={() => setActiveTab('guests')}
              className={`flex-1 py-2.5 text-xs font-medium transition-all relative ${
                activeTab === 'guests'
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <span className="flex flex-col items-center gap-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none ${
                  activeTab === 'guests' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/10 text-white/50'
                }`}>
                  {guests.length}
                </span>
                <span>👥 Invitados</span>
              </span>
              {activeTab === 'guests' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2.5 text-xs font-medium transition-all relative ${
                activeTab === 'pending'
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <span className="flex flex-col items-center gap-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none ${
                  activeTab === 'pending' 
                    ? 'bg-yellow-500/30 text-white' 
                    : 'bg-white/10 text-white/50'
                }`}>
                  {pendingMessages.length}
                </span>
                <span>⏳ Mensajes</span>
              </span>
              {activeTab === 'pending' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex-1 py-2.5 text-xs font-medium transition-all relative ${
                activeTab === 'approved'
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <span className="flex flex-col items-center gap-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none ${
                  activeTab === 'approved' 
                    ? 'bg-green-500/30 text-white' 
                    : 'bg-white/10 text-white/50'
                }`}>
                  {approvedMessages.length}
                </span>
                <span>✅ Aprobados</span>
              </span>
              {activeTab === 'approved' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full"></div>
              )}
            </button>
          </div>
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
              {/* Guest Stats */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 mb-4">
                  {/* Header with Refresh Button */}
                  <div className="flex items-center justify-end mb-3">
                    <button
                      onClick={() => fetchGuests(false)}
                      className="p-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                      title="Actualizar invitados"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  {/* Row 1: Invitados */}
                  <div className="flex items-center justify-around gap-3 pb-3 mb-3 border-b border-white/10">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-1 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/30 flex items-center justify-center text-2xl border border-blue-400/30">
                        👥
                      </div>
                      <div className="text-white text-xl font-bold">{guests.length}</div>
                      <div className="text-blue-200 text-xs font-medium mt-0.5">Invitados</div>
                    </div>
                    
                    <div className="w-px h-12 bg-white/20"></div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-1 rounded-full bg-gradient-to-br from-pink-500/30 to-pink-600/30 flex items-center justify-center text-2xl border border-pink-400/30">
                        👰
                      </div>
                      <div className="text-white text-xl font-bold">
                        {guests.filter(g => g.guest_from === 'wife').length}
                      </div>
                      <div className="text-pink-200 text-xs font-medium mt-0.5">Novia</div>
                    </div>
                    
                    <div className="w-px h-12 bg-white/20"></div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-1 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-600/30 flex items-center justify-center text-2xl border border-cyan-400/30">
                        🤵
                      </div>
                      <div className="text-white text-xl font-bold">
                        {guests.filter(g => g.guest_from === 'husband').length}
                      </div>
                      <div className="text-cyan-200 text-xs font-medium mt-0.5">Novio</div>
                    </div>
                    
                    <div className="w-px h-12 bg-white/20"></div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-1 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/30 flex items-center justify-center text-2xl border border-purple-400/30">
                        🎉
                      </div>
                      <div className="text-white text-xl font-bold">
                        {guests.reduce((sum, g) => sum + (g.num_guests || 0), 0)}
                      </div>
                      <div className="text-purple-200 text-xs font-medium mt-0.5">Personas</div>
                    </div>
                  </div>

                  {/* Row 2: Confirmados y Dinero */}
                  <div className="flex items-center justify-around gap-3">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-1 rounded-full bg-gradient-to-br from-green-500/30 to-green-600/30 flex items-center justify-center text-2xl border border-green-400/30">
                        ✅
                      </div>
                      <div className="text-white text-xl font-bold">
                        {guests.filter(g => g.confirmed).length}
                      </div>
                      <div className="text-green-200 text-xs font-medium mt-0.5">Confirmados</div>
                    </div>
                    
                    <div className="w-px h-12 bg-white/20"></div>
                    
                    <div className="text-center flex-1">
                      <div className="w-12 h-12 mx-auto mb-1 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 flex items-center justify-center text-2xl border border-emerald-400/30">
                        💲
                      </div>
                      <div className="text-white text-base font-bold">
                        ${guests.reduce((sum, g) => sum + ((g.cost_per_person || 0) * (g.num_guests || 0)), 0).toLocaleString('es-AR')}
                      </div>
                      <div className="text-emerald-200 text-xs font-medium mt-0.5">Total Esperado</div>
                    </div>
                    
                    <div className="w-px h-12 bg-white/20"></div>
                    
                    <div className="text-center flex-1">
                      <div className="w-12 h-12 mx-auto mb-1 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 flex items-center justify-center text-2xl border border-yellow-400/30">
                        💰
                      </div>
                      <div className="text-white text-base font-bold">
                        ${Object.values(allGuestPayments).reduce((sum, amount) => sum + amount, 0).toLocaleString('es-AR')}
                      </div>
                      <div className="text-yellow-200 text-xs font-medium mt-0.5">Recaudado</div>
                    </div>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 mb-4">
                  {/* Filters Legend */}
                  <div className="mb-3 pb-3 border-b border-white/10">
                    <h3 className="text-white/80 text-sm font-semibold flex items-center gap-2">
                      🎯 Filtros rápidos
                    </h3>
                  </div>

                  {/* Search Bar with Add Button */}
                  <div className="mb-4 flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-lg">
                        🔍
                      </span>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Nombre, Apellido, etc..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/25 transition-all"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setShowGuestForm(!showGuestForm);
                        setEditingGuest(null);
                        resetGuestForm();
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium shadow-lg whitespace-nowrap text-sm"
                    >
                      {showGuestForm ? '❌ Cancelar' : '➕ Nuevo'}
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="space-y-2.5">
                    {/* Estado Filters */}
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 text-xs font-semibold whitespace-nowrap">Estado:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setFilterConfirmed('all')}
                          className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            filterConfirmed === 'all'
                              ? 'bg-white/30 text-white border-2 border-white/50'
                              : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                          }`}
                        >
                          Todos
                        </button>
                        <button
                          onClick={() => setFilterConfirmed('confirmed')}
                          className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            filterConfirmed === 'confirmed'
                              ? 'bg-green-500/40 text-white border-2 border-green-400/60'
                              : 'bg-white/10 text-white/70 border border-white/20 hover:bg-green-500/20'
                          }`}
                        >
                          ✅ Si Voy
                        </button>
                        <button
                          onClick={() => setFilterConfirmed('pending')}
                          className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            filterConfirmed === 'pending'
                              ? 'bg-yellow-500/40 text-white border-2 border-yellow-400/60'
                              : 'bg-white/10 text-white/70 border border-white/20 hover:bg-yellow-500/20'
                          }`}
                        >
                          ⏳ Pendiente
                        </button>
                      </div>
                    </div>

                    {/* Lado Filters */}
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 text-xs font-semibold whitespace-nowrap">Lado:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setFilterGuestFrom('all')}
                          className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            filterGuestFrom === 'all'
                              ? 'bg-white/30 text-white border-2 border-white/50'
                              : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                          }`}
                        >
                          Ambos
                        </button>
                        <button
                          onClick={() => setFilterGuestFrom('wife')}
                          className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            filterGuestFrom === 'wife'
                              ? 'bg-pink-500/40 text-white border-2 border-pink-400/60'
                              : 'bg-white/10 text-white/70 border border-white/20 hover:bg-pink-500/20'
                          }`}
                        >
                          👰 Novia
                        </button>
                        <button
                          onClick={() => setFilterGuestFrom('husband')}
                          className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            filterGuestFrom === 'husband'
                              ? 'bg-cyan-500/40 text-white border-2 border-cyan-400/60'
                              : 'bg-white/10 text-white/70 border border-white/20 hover:bg-cyan-500/20'
                          }`}
                        >
                          🤵 Novio
                        </button>
                      </div>
                    </div>

                    {/* Clear Filters Row */}
                    {(searchTerm || filterConfirmed !== 'all' || filterGuestFrom !== 'all') && (
                      <div className="flex items-center justify-between pt-1 border-t border-white/10">
                        <p className="text-white/60 text-xs">
                          📊 {filteredGuests.length} de {guests.length} invitados
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterConfirmed('all');
                            setFilterGuestFrom('all');
                          }}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/30 text-white border border-red-400/40 hover:bg-red-500/40 transition-all"
                        >
                          ✕ Limpiar filtros
                        </button>
                      </div>
                    )}
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
                ) : (
                  /* Table View */
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider w-[25%]">
                              Invitado
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-white/90 uppercase tracking-wider w-[40%]">
                              Info
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-white/90 uppercase tracking-wider w-[35%]">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {filteredGuests.map((guest) => {
                            const totalPersonas = guest.num_guests || 0;
                            const costoTotal = (guest.cost_per_person || 0) * totalPersonas;
                            const totalPagado = allGuestPayments[guest.id] || 0;
                            
                            return (
                              <tr key={guest.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-3 py-2 w-[25%]">
                                  <div>
                                    <div className="text-white font-medium text-xs">
                                      {guest.first_name} {guest.last_name}
                                    </div>
                                    {guest.nickname && (
                                      <div className="text-white/60" style={{ fontSize: '12px' }}>
                                        ({guest.nickname})
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2 w-[40%]">
                                  <div className="text-center space-y-0.5">
                                    {/* Estado */}
                                    <div className="text-xs">
                                      {guest.confirmed ? (
                                        <span className="text-green-400">✅</span>
                                      ) : (
                                        <span className="text-yellow-400">⏳</span>
                                      )}
                                    </div>
                                    {/* Personas */}
                                    <div className="text-white/80 text-xs">
                                      👤 {totalPersonas}
                                    </div>
                                    {/* Costo Total */}
                                    { costoTotal > 0 && (
                                      <>
                                        <div className="text-green-400 text-xs font-semibold whitespace-nowrap">
                                          ${costoTotal.toLocaleString('es-AR')}
                                        </div>
                                        <div className={`text-xs font-semibold whitespace-nowrap ${totalPagado > 0 ? 'text-purple-400' : 'text-white/40'}`}>
                                          💰 ${totalPagado.toLocaleString('es-AR')}
                                        </div>
                                      </>
                                    )}
                                    {/* Pagado */}
                                  </div>
                                </td>
                                <td className="px-3 py-2 w-[35%]">
                                  <div className="flex items-center justify-center gap-2">
                                     <button
                                      onClick={() => handleSendWhatsApp(guest)}
                                      className="p-1.5 bg-green-500/20 text-green-200 rounded-lg hover:bg-green-500/30 active:scale-95 transition-all"
                                      title="Enviar por WhatsApp"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                      </svg>
                                    </button>
                                    { costoTotal > 0 && (
                                      <button
                                        onClick={() => handleOpenPayments(guest)}
                                        className="p-1.5 bg-purple-500/20 text-purple-200 rounded-lg hover:bg-purple-500/30 active:scale-95 transition-all text-sm"
                                        title="Ver pagos"
                                      >
                                        💰
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleEditGuest(guest)}
                                      className="p-1.5 bg-blue-500/20 text-blue-200 rounded-lg hover:bg-blue-500/30 active:scale-95 transition-all text-sm"
                                      title="Editar"
                                    >
                                      ✏️
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
                  <div className="space-y-4">
                    {/* Header with Refresh */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-white/70 text-sm font-medium">
                        Mensajes pendientes de aprobación
                      </h2>
                      <button
                        onClick={() => fetchMessages(false)}
                        className="p-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                        title="Actualizar mensajes"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                    
                    {pendingMessages.map((msg) => (
                      <MessageCard
                        key={msg.id}
                        message={msg}
                        onApprove={handleApprove}
                        onDelete={handleDelete}
                        isPending={true}
                      />
                    ))}
                  </div>
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
                  <div className="space-y-4">
                    {/* Header with Refresh */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-white/70 text-sm font-medium">
                        Mensajes aprobados
                      </h2>
                      <button
                        onClick={() => fetchMessages(false)}
                        className="p-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                        title="Actualizar mensajes"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                    
                    {approvedMessages.map((msg) => (
                      <MessageCard
                        key={msg.id}
                        message={msg}
                        onUnapprove={handleUnapprove}
                        onDelete={handleDelete}
                        isPending={false}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* WhatsApp Preview Modal */}
      {showWhatsAppPreview && previewGuest && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowWhatsAppPreview(false);
              setPreviewGuest(null);
            }
          }}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from {
                transform: translateY(20px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
          <div 
            className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 border border-white/20 w-full max-w-md shadow-2xl"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-full">
                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Enviar por WhatsApp
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowWhatsAppPreview(false);
                  setPreviewGuest(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Guest Info */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-xs mb-1">Invitado:</div>
                <div className="text-white font-semibold">
                  {previewGuest.first_name} {previewGuest.last_name}
                  {previewGuest.nickname && (
                    <span className="text-white/60 font-normal"> ({previewGuest.nickname})</span>
                  )}
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <div className="text-white/60 text-xs mb-2">Vista previa del mensaje:</div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                    ¡Hola {previewGuest.nickname || previewGuest.first_name}! 👋
                    {'\n\n'}
                    ¡Nos casamos! 💍💐
                    {'\n\n'}
                    Te invitamos a nuestra boda. Aquí está tu invitación personalizada:
                    {'\n\n'}
                    <a 
                      href={`${window.location.origin}?code=${previewGuest.guest_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 font-mono text-xs break-all hover:text-green-300 underline transition-colors"
                    >
                      {window.location.origin}?code={previewGuest.guest_code}
                    </a>
                    {'\n\n'}
                    ¡Esperamos verte allí! 🎉
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={confirmSendWhatsApp}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Abrir WhatsApp
                </button>
                <button
                  onClick={() => {
                    setShowWhatsAppPreview(false);
                    setPreviewGuest(null);
                  }}
                  className="px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Payments Modal */}
      {showPaymentsModal && selectedGuest && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPaymentsModal(false);
              setSelectedGuest(null);
              setShowAddPayment(false);
            }
          }}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-full">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Pagos - {selectedGuest.first_name} {selectedGuest.last_name}
                  </h3>
                  {selectedGuest.nickname && (
                    <p className="text-white/60 text-sm">({selectedGuest.nickname})</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPaymentsModal(false);
                  setSelectedGuest(null);
                  setShowAddPayment(false);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Payment Summary */}
            <div className="bg-white/5 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-200 text-sm">Total a Pagar</span>
                <span className="text-white text-base font-bold">
                  ${((selectedGuest.cost_per_person || 0) * selectedGuest.num_guests || 0).toLocaleString('es-AR')}
                </span>
              </div>
              <div className="h-px bg-white/10"></div>
              <div className="flex items-center justify-between">
                <span className="text-green-200 text-sm">Total Pagado</span>
                <span className="text-green-400 text-base font-bold">
                  ${getTotalPaid(guestPayments).toLocaleString('es-AR')}
                </span>
              </div>
              <div className="h-px bg-white/10"></div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  getTotalPaid(guestPayments) >= (selectedGuest.cost_per_person || 0) * selectedGuest.num_guests || 0
                    ? 'text-green-200'
                    : 'text-red-200'
                }`}>Saldo</span>
                <span className={`text-base font-bold ${
                  getTotalPaid(guestPayments) >= (selectedGuest.cost_per_person || 0) * selectedGuest.num_guests || 0
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  ${(((selectedGuest.cost_per_person || 0) * selectedGuest.num_guests || 0) - getTotalPaid(guestPayments)).toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Add Payment Button */}
            {!showAddPayment && (
              <button
                onClick={() => setShowAddPayment(true)}
                className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold"
              >
                ➕ Agregar Pago
              </button>
            )}

            {/* Add Payment Form */}
            {showAddPayment && (
              <form onSubmit={handleAddPayment} className="bg-white/5 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-white/90 text-sm font-medium block mb-2">
                      Monto *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-white/90 text-sm font-medium block mb-2">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={paymentForm.payment_date}
                      onChange={(e) => setPaymentForm({...paymentForm, payment_date: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-white/90 text-sm font-medium block mb-2">
                    Notas
                  </label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                    rows="2"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
                  >
                    💾 Guardar Pago
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddPayment(false);
                      setPaymentForm({
                        amount: '',
                        payment_date: new Date().toISOString().split('T')[0],
                        notes: ''
                      });
                    }}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Payments List */}
            <div>
              <h4 className="text-white font-semibold mb-3">Historial de Pagos</h4>
              {guestPayments.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  Sin pagos registrados
                </div>
              ) : (
                <div className="space-y-2">
                  {guestPayments.map((payment) => (
                    <div key={payment.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-green-400 font-bold text-lg">
                            ${parseFloat(payment.amount).toLocaleString('es-AR')}
                          </span>
                          <span className="text-white/60 text-sm">
                            📅 {new Date(payment.payment_date).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        {payment.notes && (
                          <p className="text-white/70 text-sm">{payment.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="p-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition-all"
                        title="Eliminar pago"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Guest Form Modal */}
      {showGuestForm && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowGuestForm(false);
              setEditingGuest(null);
              resetGuestForm();
            }
          }}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from {
                transform: translateY(20px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
          <div 
            className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-8 border border-white/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {editingGuest ? '✏️ Editar Invitado' : '➕ Nuevo Invitado'}
              </h3>
              <button
                onClick={() => {
                  setShowGuestForm(false);
                  setEditingGuest(null);
                  resetGuestForm();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveGuest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/90 text-sm font-medium block mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={guestForm.first_name}
                    onChange={(e) => setGuestForm({...guestForm, first_name: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-white/90 text-sm font-medium block mb-2">
                    Código Invitado {!editingGuest && '(Se genera automáticamente)'}
                  </label>
                  <input
                    type="text"
                    value={editingGuest ? guestForm.guest_code : 'Se generará al guardar'}
                    onChange={(e) => setGuestForm({...guestForm, guest_code: e.target.value.toUpperCase()})}
                    placeholder={editingGuest ? "Código del invitado" : "Se generará automáticamente"}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white/70 placeholder-white/50 border border-white/30 focus:outline-none cursor-not-allowed"
                    readOnly
                    disabled
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
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-white/90 text-sm font-medium block mb-2">
                    Nº Acompañantes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={guestForm.num_guests}
                    onChange={(e) => setGuestForm({...guestForm, num_guests: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-white/90 text-sm font-medium block mb-2">
                    Lado *
                  </label>
                  <select
                    value={guestForm.guest_from}
                    onChange={(e) => setGuestForm({...guestForm, guest_from: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="wife">👰 Novia</option>
                    <option value="husband">🤵 Novio</option>
                  </select>
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
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                <input
                  type="checkbox"
                  id="confirmado"
                  checked={guestForm.confirmed}
                  onChange={(e) => setGuestForm({...guestForm, confirmed: e.target.checked})}
                  className="w-5 h-5 rounded accent-green-500"
                />
                <label htmlFor="confirmado" className="text-white/90 text-sm font-medium cursor-pointer">
                  ✅ Confirmado
                </label>
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 active:scale-95 transition-all font-semibold shadow-lg text-sm"
                  title={editingGuest ? 'Guardar cambios' : 'Agregar invitado'}
                >
                  {editingGuest ? '💾 Guardar' : '➕ Agregar'}
                </button>
                {editingGuest && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Estás seguro de eliminar este invitado?')) {
                        handleDeleteGuest(editingGuest.id);
                        setShowGuestForm(false);
                        setEditingGuest(null);
                        resetGuestForm();
                      }
                    }}
                    className="px-4 py-3 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 active:scale-95 transition-all font-semibold text-xl"
                    title="Eliminar invitado"
                  >
                    🗑️
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowGuestForm(false);
                    setEditingGuest(null);
                    resetGuestForm();
                  }}
                  className="px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 active:scale-95 transition-all font-semibold text-xl"
                  title="Cerrar"
                >
                  ✕
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
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

MessageCard.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    color: PropTypes.string,
    created_at: PropTypes.string,
  }).isRequired,
  onApprove: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onUnapprove: PropTypes.func,
  isPending: PropTypes.bool.isRequired,
};

export default AdminPanel;
