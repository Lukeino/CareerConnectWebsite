// ==============================================
// CONTEXT AUTENTICAZIONE
// 
// Context React per gestire lo stato di autenticazione globale.
// Fornisce funzioni per login, registrazione, logout e refresh
// dei dati utente. Integra persistenza localStorage e API calls.
// ==============================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api.js';

// CREAZIONE CONTEXT AUTENTICAZIONE
const AuthContext = createContext();

// CONFIGURAZIONE API CENTRALIZZATA
const API_BASE_URL = API_CONFIG.BASE_URL;

// DEBUG: Verifica configurazione API
console.log('🔗 API_BASE_URL:', API_BASE_URL);

// HOOK PERSONALIZZATO PER UTILIZZARE IL CONTEXT
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Validazione: hook utilizzato solo dentro AuthProvider
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// PROVIDER COMPONENTE - Gestisce stato autenticazione globale
export const AuthProvider = ({ children }) => {
  // STATI DEL CONTEXT
  const [user, setUser] = useState(null);           // Dati utente corrente (null se non autenticato)
  const [loading, setLoading] = useState(true);     // Stato caricamento iniziale

  // EFFECT: RIPRISTINO SESSIONE DA LOCALSTORAGE
  // Eseguito al mount del provider per recuperare sessioni persistenti
  useEffect(() => {
    // Tentativo di recupero dati utente salvati localmente
    const savedUser = localStorage.getItem('careerconnect_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log('👤 User restored from localStorage:', parsedUser);
      } catch (error) {
        // Cleanup in caso di dati corrotti
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('careerconnect_user');
      }
    }
    setLoading(false);                             // Termina stato caricamento
  }, []);
  // FUNZIONE PER TRADURRE ERRORI DEL SERVER
  const translateError = (error) => {
    const errorTranslations = {
      'User not found': 'Utente non trovato',
      'Invalid password': 'Password non corretta',
      'Invalid credentials': 'Credenziali non valide',
      'Connection error': 'Errore di connessione al server',
      'Email already exists': 'Email già utilizzata',
      'UNIQUE constraint failed: users.email': 'Email già utilizzata'
    };
    
    // Controlla se l'errore contiene un messaggio traducibile
    for (const [englishError, italianError] of Object.entries(errorTranslations)) {
      if (error.includes(englishError)) {
        return italianError;
      }
    }
    
    // Se non trova una traduzione, restituisce l'errore originale
    return error;
  };

  // FUNZIONE LOGIN - Autenticazione utente via API
  const login = async (email, password) => {
    try {
      console.log('🔄 Attempting login via API...');
      
      // Chiamata API per autenticazione
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Login riuscito: aggiorna stato e localStorage
        console.log('✅ Login successful:', data.user);
        setUser(data.user);
        localStorage.setItem('careerconnect_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        // Login fallito: restituisce errore tradotto
        console.error('❌ Login failed:', data.error);
        const translatedError = translateError(data.error);
        return { success: false, error: translatedError };
      }
    } catch (error) {
      // Errore di connessione o altro
      console.error('❌ Login error:', error);
      return { success: false, error: translateError('Connection error') };
    }  };

  // FUNZIONE REGISTRAZIONE - Creazione nuovo account via API
  const register = async (userData) => {
    try {
      console.log('🔄 Starting registration via API...', userData);
      
      // Chiamata API per registrazione
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Registrazione riuscita: auto-login del nuovo utente
        console.log('✅ Registration successful:', data.user);
        setUser(data.user);
        localStorage.setItem('careerconnect_user', JSON.stringify(data.user));
        return { success: true, user: data.user };      } else {
        // Registrazione fallita: restituisce errore tradotto
        console.error('❌ Registration failed:', data.error);
        const translatedError = translateError(data.error);
        return { success: false, error: translatedError };
      }
    } catch (error) {
      // Errore di connessione o altro
      console.error('❌ Registration error:', error);
      return { success: false, error: translateError('Connection error') };
    }
  };

  // FUNZIONE LOGOUT - Terminazione sessione
  const logout = () => {
    console.log('👋 Logging out user');
    setUser(null);                                 // Reset stato utente
    localStorage.removeItem('careerconnect_user'); // Rimozione dati persistenti
  };

  // FUNZIONE REFRESH - Aggiornamento dati utente da server
  // Utile dopo operazioni che modificano i dati utente (es. upload CV)
  const refreshUser = async () => {
    if (!user || !user.id) return;                // Validazione: utente deve essere loggato
    
    try {
      console.log('🔄 Refreshing user data for ID:', user.id);
      
      // Fetch dati aggiornati dal server
      const response = await fetch(`${API_BASE_URL}/user/${user.id}`);
      
      if (response.ok) {
        const userData = await response.json();
        // Merge dei dati esistenti con quelli aggiornati
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('careerconnect_user', JSON.stringify(updatedUser));
        console.log('✅ User data refreshed:', updatedUser);
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
    }
  };
  
  // VALORE DEL CONTEXT - Oggetto esposto a tutti i componenti figli
  const value = {
    // Dati stato
    user,                                          // Oggetto utente corrente
    loading,                                       // Stato caricamento iniziale
    
    // Funzioni autenticazione
    login,                                         // Funzione login
    register,                                      // Funzione registrazione
    logout,                                        // Funzione logout
    refreshUser,                                   // Funzione refresh dati
    
    // Computed properties - Helper per controlli rapidi
    isAuthenticated: !!user,                       // True se utente loggato
    isRecruiter: user?.user_type === 'recruiter',  // True se tipo recruiter
    isCandidate: user?.user_type === 'candidate',  // True se tipo candidato
    isAdmin: user?.user_type === 'admin'           // True se tipo admin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
