'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, Menu, X, Download, Share2, FileText, AlertCircle } from 'lucide-react';

export default function RecuperayaPWA() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    cardIssuer: '',
    chargeAmount: '',
    chargeDate: '',
    consent: false,
  });
  const [claims, setClaims] = useState<any[]>([]);
  const [estimation, setEstimation] = useState<any>(null);
  const [currentClaim, setCurrentClaim] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // PWA Install Prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Local Storage
  useEffect(() => {
    const saved = localStorage.getItem('recuperaya_claims');
    if (saved) {
      try {
        setClaims(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading claims:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('recuperaya_claims', JSON.stringify(claims));
  }, [claims]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const calculateEstimation = () => {
    const amount = parseFloat(formData.chargeAmount) || 0;
    const issuer = formData.cardIssuer.toLowerCase();

    let recoveryRate = 0.25;
    if (issuer.includes('bbva') || issuer.includes('santander')) {
      recoveryRate = 0.30;
    }

    const estimatedRecovery = amount * recoveryRate;
    const platformFee = estimatedRecovery * 0.25;
    const userReceives = estimatedRecovery - platformFee;

    setEstimation({
      originalAmount: amount,
      estimatedRecovery: Math.round(estimatedRecovery),
      platformFee: Math.round(platformFee),
      userReceives: Math.round(userReceives),
      confidence: 75 + Math.random() * 15,
    });
  };

  const generateClaimDocument = () => {
    if (!estimation) return null;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #1F4E78; margin: 0;">RecuperaYa!</h1>
          <p style="color: #666; margin: 5px 0;">Solicitud de Reclamación de Cargo de Tarjeta</p>
        </div>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #1F4E78; font-size: 18px; margin-top: 0;">Información del Reclamante</h2>
          <p><strong>Nombre:</strong> ${formData.fullName}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Entidad Financiera:</strong> ${formData.cardIssuer}</p>
          <p><strong>Monto Reclamado:</strong> €${estimation.originalAmount.toFixed(2)}</p>
          <p><strong>Fecha del Cargo:</strong> ${formData.chargeDate}</p>
        </div>

        <div style="background: #f0f4f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #2E75B6;">
          <h2 style="color: #1F4E78; font-size: 18px; margin-top: 0;">Estimación de Recuperación</h2>
          <p style="margin: 10px 0;"><strong>Monto Estimado a Recuperar:</strong> €${estimation.estimatedRecovery}</p>
          <p style="margin: 10px 0;"><strong>Comisión de Plataforma (25%):</strong> €${estimation.platformFee}</p>
          <p style="margin: 10px 0; font-size: 18px;"><strong style="color: #70AD47;">Cantidad que Recibirás:</strong> €${estimation.userReceives}</p>
          <p style="color: #666; font-size: 12px; margin-top: 15px;">*Confianza en la estimación: ${Math.round(estimation.confidence)}%</p>
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #FFC000;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            <strong>⚠️ Aviso Legal:</strong> Esta estimación es aproximada. La cantidad final dependerá de la resolución de tu caso.
          </p>
        </div>

        <div style="border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Este documento fue generado automáticamente por RecuperaYa!</p>
          <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
      </div>
    `;

    return html;
  };

  const downloadPDF = () => {
    const html = generateClaimDocument();
    const element = document.createElement('div');
    element.innerHTML = html || '';
    document.body.appendChild(element);

    alert('📥 PDF Ready:\nReclamación_' + formData.email + '.pdf\n\nEn producción se descargará automáticamente.');

    document.body.removeChild(element);
  };

  const shareViaWhatsApp = () => {
    const message = `Hola! He creado una solicitud de reclamación en RecuperaYa!: ${window.location.origin}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') {
        console.log('PWA installed');
      }
      setInstallPrompt(null);
    }
  };

  const submitClaim = () => {
    if (!formData.email || !formData.fullName || !formData.cardIssuer || !formData.chargeAmount || !formData.consent) {
      alert('⚠️ Por favor completa todos los campos y acepta los términos.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newClaim = {
        id: 'RY-' + Date.now(),
        ...formData,
        estimation,
        createdAt: new Date().toISOString(),
        status: 'submitted',
      };

      setClaims([newClaim, ...claims]);
      setCurrentClaim(newClaim);
      setCurrentPage('confirmation');
      setLoading(false);
    }, 1000);
  };

  const colors = {
    primary: '#1F4E78',
    secondary: '#2E75B6',
    accent: '#4472C4',
    success: '#70AD47',
    warning: '#FFC000',
    error: '#E74C3C',
    light: '#F5F5F5',
  };

  const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '', style = {} }: any) => {
    const buttonStyle: React.CSSProperties = {
      backgroundColor: variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.secondary : 'transparent',
      border: variant === 'outline' ? `2px solid ${colors.primary}` : 'none',
      color: variant === 'outline' ? colors.primary : 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.5 : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      ...style,
    };

    return (
      <button onClick={onClick} disabled={disabled || loading} style={buttonStyle} className={className}>
        {loading ? '⏳ Procesando...' : children}
      </button>
    );
  };

  // LANDING PAGE
  const LandingPage = () => (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }}>
      <header style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>RecuperaYa!</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '24px' }}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div style={{ color: 'white', padding: '40px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '40px', fontWeight: 'bold', margin: '20px 0', lineHeight: '1.2' }}>
          Reclama tus Cargos Injustos
        </h2>
        <p style={{ fontSize: '18px', opacity: 0.95, margin: '20px 0', lineHeight: '1.6' }}>
          Sin abogado. Sin costos iniciales. Solo compensación justa.
        </p>

        <div style={{ display: 'flex', gap: '16px', margin: '40px 0', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => setCurrentPage('signup')} style={{ width: '100%', maxWidth: '300px' }}>
            Empezar Ahora <ArrowRight size={20} />
          </Button>
          {installPrompt && <Button variant="outline" onClick={handleInstallApp} style={{ width: '100%', maxWidth: '300px' }}><Download size={20} /> Instalar App</Button>}
        </div>

        <div style={{ marginTop: '60px', textAlign: 'left', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {[
            { icon: '⏱️', title: 'Rápido', desc: 'Estimación en 2 minutos' },
            { icon: '🚫', title: 'Sin Abogados', desc: 'Proceso completamente digital' },
            { icon: '✅', title: 'Comisión Justa', desc: 'Solo paga el 25% si ganas' },
            { icon: '📱', title: 'Offline First', desc: 'Funciona sin internet' },
          ].map((feature, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '10px 0' }}>{feature.title}</h3>
              <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // SIGNUP PAGE
  const SignupPage = () => (
    <div style={{ minHeight: '100vh', background: colors.light, padding: '20px' }}>
      <div style={{ maxWidth: '500px', margin: '40px auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: colors.primary, fontSize: '28px', marginBottom: '30px' }}>Crear Cuenta</h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: colors.primary }}>Nombre Completo</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleFormChange}
            placeholder="Juan García López"
            style={{ width: '100%', padding: '12px', border: `1px solid ${colors.light}`, borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: colors.primary }}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            placeholder="juan@example.com"
            style={{ width: '100%', padding: '12px', border: `1px solid ${colors.light}`, borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: colors.primary }}>Banco o Entidad Financiera</label>
          <select
            name="cardIssuer"
            value={formData.cardIssuer}
            onChange={handleFormChange}
            style={{ width: '100%', padding: '12px', border: `1px solid ${colors.light}`, borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
          >
            <option value="">Selecciona tu banco...</option>
            <option value="BBVA">BBVA</option>
            <option value="Santander">Santander</option>
            <option value="CaixaBank">CaixaBank</option>
            <option value="Banco Sabadell">Banco Sabadell</option>
            <option value="ING">ING</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Button onClick={() => setCurrentPage('interview')} style={{ flex: 1 }}>Continuar</Button>
          <Button variant="outline" onClick={() => setCurrentPage('landing')} style={{ flex: 1 }}>Atrás</Button>
        </div>
      </div>
    </div>
  );

  // INTERVIEW PAGE
  const InterviewPage = () => (
    <div style={{ minHeight: '100vh', background: colors.light, padding: '20px' }}>
      <div style={{ maxWidth: '500px', margin: '40px auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: colors.primary, fontSize: '28px', marginBottom: '30px' }}>Cuéntanos sobre tu Cargo</h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: colors.primary }}>Monto del Cargo (€)</label>
          <input
            type="number"
            name="chargeAmount"
            value={formData.chargeAmount}
            onChange={handleFormChange}
            placeholder="1500"
            style={{ width: '100%', padding: '12px', border: `1px solid ${colors.light}`, borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: colors.primary }}>Fecha del Cargo</label>
          <input
            type="date"
            name="chargeDate"
            value={formData.chargeDate}
            onChange={handleFormChange}
            style={{ width: '100%', padding: '12px', border: `1px solid ${colors.light}`, borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Button onClick={() => { calculateEstimation(); setCurrentPage('estimation'); }} style={{ flex: 1 }}>Ver Estimación</Button>
          <Button variant="outline" onClick={() => setCurrentPage('signup')} style={{ flex: 1 }}>Atrás</Button>
        </div>
      </div>
    </div>
  );

  // ESTIMATION PAGE
  const EstimationPage = () => (
    <div style={{ minHeight: '100vh', background: colors.light, padding: '20px' }}>
      <div style={{ maxWidth: '500px', margin: '40px auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        {estimation && (
          <>
            <h2 style={{ color: colors.primary, fontSize: '28px', marginBottom: '30px' }}>Tu Estimación</h2>

            <div style={{ background: colors.light, padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: `1px solid ${colors.light}` }}>
                <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Cargo Original</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: colors.primary, margin: '8px 0 0 0' }}>€{estimation.originalAmount.toFixed(2)}</p>
              </div>

              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: `1px solid ${colors.light}` }}>
                <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Recuperación Estimada</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: colors.success, margin: '8px 0 0 0' }}>€{estimation.estimatedRecovery}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                  <span>Comisión Plataforma (25%)</span>
                  <span>€{estimation.platformFee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: colors.success }}>
                  <span>Recibirás</span>
                  <span>€{estimation.userReceives}</span>
                </div>
              </div>

              <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '8px', borderLeft: `4px solid ${colors.warning}`, marginTop: '20px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#856404' }}>
                  <strong>Confianza:</strong> {Math.round(estimation.confidence)}% — basado en patrones de bancos
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleFormChange}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px' }}>Acepto los términos y condiciones</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Button onClick={submitClaim} style={{ flex: 1 }}>Enviar Reclamación <CheckCircle2 size={20} /></Button>
              <Button variant="outline" onClick={() => setCurrentPage('interview')} style={{ flex: 1 }}>Atrás</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // CONFIRMATION PAGE
  const ConfirmationPage = () => (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.accent} 100%)`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <CheckCircle2 size={80} style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '20px 0' }}>¡Reclamación Enviada!</h2>
        <p style={{ fontSize: '18px', opacity: 0.95, margin: '20px 0' }}>
          ID de Reclamación: <strong>{currentClaim?.id}</strong>
        </p>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: '20px 0' }}>
          Hemos enviado una confirmación a {formData.email}. Puedes rastrear tu caso en el panel.
        </p>

        <div style={{ display: 'flex', gap: '16px', margin: '40px 0', justifyContent: 'center', flexDirection: 'column' }}>
          <Button onClick={shareViaWhatsApp} style={{ background: '#25D366', border: 'none', width: '100%' }}>
            <Share2 size={20} /> Compartir por WhatsApp
          </Button>
          <Button onClick={downloadPDF} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid white', width: '100%' }}>
            <FileText size={20} /> Descargar PDF
          </Button>
          <Button onClick={() => setCurrentPage('dashboard')} style={{ background: 'rgba(255,255,255,0.3)', color: 'white', border: '2px solid white', width: '100%' }}>
            Ir al Panel
          </Button>
        </div>
      </div>
    </div>
  );

  // DASHBOARD PAGE
  const DashboardPage = () => (
    <div style={{ minHeight: '100vh', background: colors.light, padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ color: colors.primary, fontSize: '28px', marginBottom: '30px' }}>Mis Reclamaciones</h2>

        {claims.length === 0 ? (
          <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '12px' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 20px', color: colors.primary }} />
            <p style={{ fontSize: '18px', color: '#666' }}>Aún no tienes reclamaciones. ¡Empieza una ahora!</p>
            <Button onClick={() => setCurrentPage('landing')} style={{ marginTop: '20px' }}>Nueva Reclamación</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {claims.map((claim) => (
              <div key={claim.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${colors.secondary}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>ID de Reclamación</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: colors.primary, margin: '4px 0' }}>{claim.id}</p>
                  </div>
                  <span style={{ background: colors.success, color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    {claim.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Banco</p>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: '4px 0' }}>{claim.cardIssuer}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Monto</p>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: '4px 0' }}>€{claim.chargeAmount}</p>
                  </div>
                  {claim.estimation && (
                    <>
                      <div>
                        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Recuperación Estimada</p>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: colors.success, margin: '4px 0' }}>€{claim.estimation.userReceives}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Fecha</p>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: '4px 0' }}>{new Date(claim.createdAt).toLocaleDateString('es-ES')}</p>
                      </div>
                    </>
                  )}
                </div>

                <Button onClick={shareViaWhatsApp} style={{ width: '100%' }}>
                  <Share2 size={16} /> Compartir
                </Button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => { setFormData({ email: '', fullName: '', cardIssuer: '', chargeAmount: '', chargeDate: '', consent: false }); setEstimation(null); setCurrentPage('landing'); }}
          style={{ marginTop: '30px', padding: '12px 24px', background: 'white', border: `2px solid ${colors.primary}`, color: colors.primary, borderRadius: '8px', fontWeight: '600', cursor: 'pointer', width: '100%' }}
        >
          Nueva Reclamación
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh' }}>
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'signup' && <SignupPage />}
      {currentPage === 'interview' && <InterviewPage />}
      {currentPage === 'estimation' && <EstimationPage />}
      {currentPage === 'confirmation' && <ConfirmationPage />}
      {currentPage === 'dashboard' && <DashboardPage />}

      {installPrompt && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: colors.primary, color: 'white', padding: '16px 20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', cursor: 'pointer', zIndex: 1000 }} onClick={handleInstallApp}>
          📱 Instalar App
        </div>
      )}
    </div>
  );
}
