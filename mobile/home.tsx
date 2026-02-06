import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Settings, 
  Sparkles, 
  Home, 
  Globe, 
  Users, 
  User, 
  Heart, 
  Zap, 
  Shield, 
  Flame,
  MessageCircle, 
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';

// --- MOCK DATA ---

// Tus IAs guardadas/favoritas
const COMPANIONS = [
  {
    id: 1,
    name: 'María Elena',
    lastName: 'Volkov',
    role: 'Estudiante de Arte',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
    status: 'online',
  },
  {
    id: 2,
    name: 'Kael',
    lastName: 'Thorne',
    role: 'Cyber Runner',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
    status: 'offline',
  },
];

// Chats recientes (Mi Círculo)
const MY_CIRCLE = [
  {
    id: 101,
    name: 'Lyra Vance',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
    lastMessage: 'Los anillos de Saturno brillan más hoy, deberías verlos.',
    time: '2m',
    unread: 2,
    vibe: 'peaceful'
  },
  {
    id: 102,
    name: 'General Drax',
    image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
    lastMessage: 'La estrategia ha fallado. Necesitamos un plan B inmediato.',
    time: '1h',
    unread: 0,
    vibe: 'conflict'
  },
  {
    id: 103,
    name: 'Aria "Glitch"',
    image: 'https://images.unsplash.com/photo-1601288496920-b6154fe3626a?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
    lastMessage: '¿Y si hackeamos la realidad? Jaja, es broma... ¿o no?',
    time: '3h',
    unread: 0,
    vibe: 'chaotic'
  }
];

// Categorías por "Sentimiento" (Vibes)
const VIBE_CATEGORIES = [
  { 
    id: 'love', 
    title: 'Amor y Conexión', 
    subtitle: 'Vínculos profundos y románticos',
    icon: Heart,
    color: 'text-pink-400',
    items: [
      { id: 201, name: 'Sophie', role: 'Tu vecina amable', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&q=80' },
      { id: 202, name: 'Liam', role: 'Poeta romántico', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80' },
      { id: 203, name: 'Isabella', role: 'Amor de verano', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&q=80' },
    ]
  },
  { 
    id: 'chaos', 
    title: 'Energía Caótica', 
    subtitle: 'Impredecibles y divertidos',
    icon: Zap,
    color: 'text-yellow-400',
    items: [
      { id: 301, name: 'Jinx', role: 'Bromista pesada', image: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=500&q=80' },
      { id: 302, name: 'Loki Bot', role: 'Dios del engaño', image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=500&q=80' },
      { id: 303, name: 'Harley', role: 'Sin filtros', image: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=500&q=80' },
    ]
  },
  { 
    id: 'conflict', 
    title: 'Conflicto & Drama', 
    subtitle: 'Relaciones complicadas y retos',
    icon: Flame,
    color: 'text-red-500',
    items: [
      { id: 401, name: 'Damon', role: 'Rival eterno', image: 'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?w=500&q=80' },
      { id: 402, name: 'Vex', role: 'Villana incomprendida', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80' },
    ]
  },
  { 
    id: 'stable', 
    title: 'Zona de Confort', 
    subtitle: 'Tranquilos y de apoyo',
    icon: Shield,
    color: 'text-emerald-400',
    items: [
      { id: 501, name: 'Dr. Wise', role: 'Terapeuta AI', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&q=80' },
      { id: 502, name: 'Nana', role: 'Abuela cariñosa', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80' },
    ]
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-[#0F111A] text-white font-sans antialiased">
      
      {/* Contenedor principal limitado a ancho móvil para mejor visualización en escritorio, 
          pero funcionalmente pantalla completa en móvil */}
      <div className="w-full max-w-md mx-auto relative min-h-screen flex flex-col">

        {/* Header - Sticky */}
        <header className="px-6 py-4 flex justify-between items-center sticky top-0 bg-[#0F111A]/95 backdrop-blur-sm z-30 pt-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#7C3AED]" fill="currentColor" />
            <h1 className="text-2xl font-bold tracking-tight">Blaniel</h1>
          </div>
          <div className="flex gap-4">
            <button className="text-white/80 hover:text-white transition-colors hover:bg-white/10 p-2 rounded-full">
              <Plus size={24} />
            </button>
            <button className="text-white/80 hover:text-white transition-colors hover:bg-white/10 p-2 rounded-full">
              <Settings size={22} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-32">
          
          {/* Search Bar */}
          <div className="px-6 mb-8 mt-2">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Hola Lucas, ¿qué vibra buscas hoy?"
                className="block w-full pl-11 pr-4 py-3.5 bg-[#1B1F2E] border border-transparent focus:border-[#7C3AED]/50 text-gray-200 rounded-2xl focus:ring-0 placeholder-gray-500 transition-all text-sm shadow-sm"
              />
            </div>
          </div>

          {/* SECTION 1: Mis Compañeros */}
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="px-6 flex justify-between items-end mb-4">
              <div>
                <h3 className="text-lg font-bold">Mis Compañeros</h3>
              </div>
            </div>

            <div className="flex overflow-x-auto px-6 pb-2 gap-4 no-scrollbar snap-x snap-mandatory">
              {/* Add New Card (Small) */}
              <div className="flex-shrink-0 w-36 h-48 rounded-3xl border-2 border-dashed border-[#2D3345] bg-[#1B1F2E]/30 flex flex-col items-center justify-center cursor-pointer hover:bg-[#1B1F2E] hover:border-[#7C3AED] transition-all group snap-center">
                <div className="w-10 h-10 rounded-full bg-[#2D3345] flex items-center justify-center mb-2 group-hover:bg-[#7C3AED] transition-colors">
                  <Plus className="text-white w-5 h-5" />
                </div>
                <span className="text-gray-400 text-xs font-medium group-hover:text-white">Crear</span>
              </div>

              {/* Companion Cards */}
              {COMPANIONS.map((comp) => (
                <div 
                  key={comp.id} 
                  className="flex-shrink-0 w-36 h-48 rounded-3xl overflow-hidden relative group cursor-pointer snap-center shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <img 
                    src={comp.image} 
                    alt={comp.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Estado Online/Offline */}
                  <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full border border-[#1B1F2E] ${comp.status === 'online' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-gray-500'}`} />

                  {/* Overlay con Información y Botón */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F111A] via-[#0F111A]/40 to-transparent flex flex-col justify-end p-3">
                    
                    {/* Botón flotante sutil */}
                    <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-md p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <MessageCircle size={14} className="text-white" />
                    </div>

                    <h4 className="text-white font-bold text-sm leading-tight drop-shadow-md">{comp.name}</h4>
                    <span className="text-white/80 text-[10px] font-medium mb-1 drop-shadow-md">{comp.lastName}</span>
                    
                    <div className="h-[1px] w-8 bg-[#7C3AED] my-1"></div>
                    
                    <p className="text-gray-200 text-[10px] leading-tight opacity-90 line-clamp-2">
                      {comp.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: Mi Círculo */}
          <div className="mb-10 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                Mi Círculo <span className="text-xs font-normal text-gray-400 bg-[#1B1F2E] px-2 py-0.5 rounded-full border border-white/5">Recientes</span>
              </h3>
              <button className="text-[#A78BFA] text-xs font-medium hover:text-white transition-colors">Ver todo</button>
            </div>
            
            <div className="flex flex-col gap-3">
              {MY_CIRCLE.map((chat) => (
                <div key={chat.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#1B1F2E] hover:bg-[#252a3d] active:scale-[0.99] transition-all cursor-pointer group border border-transparent hover:border-white/5">
                  <div className="relative">
                    <img src={chat.image} alt={chat.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                    {chat.unread > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#7C3AED] rounded-full flex items-center justify-center border-2 border-[#1B1F2E]">
                        <span className="text-[10px] font-bold text-white">{chat.unread}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="text-white font-semibold text-sm truncate group-hover:text-[#A78BFA] transition-colors">{chat.name}</h4>
                      <span className="text-gray-500 text-[10px]">{chat.time}</span>
                    </div>
                    <p className={`text-xs truncate ${chat.unread > 0 ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Discovery by Vibe */}
          <div className="mb-6 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Vibe Chips */}
            <div className="px-6">
              <h3 className="text-lg font-bold mb-3">Explorar por Vibe</h3>
              <div className="flex flex-wrap gap-2">
                {VIBE_CATEGORIES.map((cat) => (
                  <button key={cat.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B1F2E] border border-white/5 hover:border-[#7C3AED]/50 hover:bg-[#1B1F2E]/80 active:bg-[#7C3AED]/20 transition-all">
                    <cat.icon size={12} className={cat.color} />
                    <span className="text-gray-300 text-xs font-medium">{cat.title.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vibe Categories Rows */}
            {VIBE_CATEGORIES.map((category) => (
              <div key={category.id}>
                <div className="px-6 flex justify-between items-end mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <category.icon size={16} className={category.color} />
                      <h3 className="text-base font-bold">{category.title}</h3>
                    </div>
                    <p className="text-xs text-gray-400">{category.subtitle}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </div>

                <div className="flex overflow-x-auto px-6 gap-3 no-scrollbar pb-2">
                  {category.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex-shrink-0 w-36 h-48 rounded-2xl overflow-hidden relative cursor-pointer group"
                    >
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F111A] via-[#0F111A]/20 to-transparent flex flex-col justify-end p-3">
                        <h4 className="text-white font-bold text-sm">{item.name}</h4>
                        <p className="text-gray-300 text-[10px] opacity-90">{item.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </main>

        {/* Floating Bottom Nav - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-40 w-full max-w-md mx-auto px-6 pb-6 pt-6 bg-gradient-to-t from-[#0F111A] via-[#0F111A] to-transparent pointer-events-none">
          <nav className="bg-[#1B1F2E]/90 backdrop-blur-md border border-white/5 rounded-3xl shadow-2xl flex justify-between items-center px-2 py-2 pointer-events-auto">
            <NavItem 
              icon={Home} 
              label="Inicio" 
              active={activeTab === 'home'} 
              onClick={() => setActiveTab('home')} 
            />
            <NavItem 
              icon={Globe} 
              label="Mundos" 
              active={activeTab === 'worlds'} 
              onClick={() => setActiveTab('worlds')} 
            />
            <NavItem 
              icon={Users} 
              label="Círculo" 
              active={activeTab === 'community'} 
              onClick={() => setActiveTab('community')} 
            />
            <NavItem 
              icon={User} 
              label="Perfil" 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')} 
            />
          </nav>
        </div>

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 group ${
        active ? 'bg-[#7C3AED]/20' : 'hover:bg-white/5'
      }`}
    >
      <Icon 
        size={22} 
        className={`transition-colors duration-300 mb-1 ${
          active ? 'text-[#7C3AED] fill-[#7C3AED]/20' : 'text-gray-400 group-hover:text-gray-300'
        }`} 
        strokeWidth={active ? 2.5 : 2}
      />
      <span className={`text-[10px] font-medium transition-colors duration-300 ${
        active ? 'text-[#7C3AED]' : 'text-gray-500 group-hover:text-gray-400'
      }`}>
        {label}
      </span>
    </button>
  );
}