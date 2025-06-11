// ==============================================
// HOOK PERSONALIZZATO - DISABILITA WHEEL SU INPUT NUMBER
// 
// Previene la modifica accidentale dei valori negli input number
// tramite rotellina del mouse. Migliora l'UX evitando cambi
// involontari durante lo scroll della pagina.
// ==============================================

import { useEffect } from 'react';

// HOOK PERSONALIZZATO PER DISABILITARE WHEEL SU INPUT NUMBER
export const useDisableNumberInputWheel = () => {
  useEffect(() => {
    // GESTORE EVENTO WHEEL
    const handleWheel = (e) => {
      // Verifica: elemento target è input number E ha il focus
      if (e.target.type === 'number' && document.activeElement === e.target) {
        e.preventDefault(); // Previene comportamento default (cambio valore)
      }
    };

    // REGISTRAZIONE EVENT LISTENER
    // passive: false permette preventDefault()
    document.addEventListener('wheel', handleWheel, { passive: false });

    // CLEANUP - Rimozione listener al unmount del componente
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []); // Dependency array vuota = esegue solo al mount/unmount
};

// EXPORT DEFAULT PER FLESSIBILITÀ D'IMPORTAZIONE
export default useDisableNumberInputWheel;
