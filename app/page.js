'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, ChevronLeft, Check, Edit2, X, Loader2 } from 'lucide-react';

import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Structure complète des questions
const allQuestions = [
  // SECTION 1: Type de demande
  {
    id: 'type_demande',
    section: 'Type de demande',
    question: 'Quel type de demande souhaitez-vous faire ?',
    type: 'select',
    required: true,
    options: [
      'Refinancement/Renouvellement hypothécaire sans changements',
      'Refinancement/Renouvellement avec ajout d\'un montant',
      'Nouvel achat propriétaire occupant',
      'Nouvel achat duplex et + propriétaire occupant et locatif',
      'Nouvel achat 100% locatif'
    ]
  },
  
  // SECTION 2: Bilan
  {
    id: 'processus_financement',
    section: 'Bilan',
    question: 'Où en êtes-vous dans votre processus de financement ?',
    type: 'select',
    required: true,
    options: [
      'J\'ai déjà commencé à me renseigner mais je n\'ai pas reçu un super deal',
      'Je veux un taux qui fonctionne et je suis prêt(e) à avancer',
      'Je veux de l\'aide avec un accompagnement personnalisé',
      'J\'ai déjà une préqualification ou offre verbale',
      'Je n\'ai pas encore regardé, mais je veux qu\'on m\'en propose mieux',
      'J\'ai été référé(e) et j\'ai entendu du bien du courtier'
    ]
  },
  {
    id: 'importance_financement',
    section: 'Bilan',
    question: 'Quel est le plus important pour vous dans votre financement hypothécaire ?',
    type: 'select',
    required: true,
    options: [
      'Le service, l\'accompagnement et une solution adaptée',
      'Le taux le plus bas, peu importe le reste'
    ]
  },
  {
    id: 'pret_avancer',
    section: 'Bilan',
    question: 'Si nous trouvons une offre avantageuse parmi 2-3 offres, seriez-vous prêt à aller de l\'avant ?',
    type: 'select',
    required: true,
    options: [
      'Oui, si c\'est la meilleure option pour moi',
      'Je préfère voir plusieurs offres avant de me décider',
      'Seulement si vous pouvez battre l\'offre que j\'ai déjà reçue',
      'Oui, avec un bon service et accompagnement',
      'Peut-être, mais je vais aussi voir ailleurs'
    ]
  },
  {
    id: 'offre_existante',
    section: 'Bilan',
    question: 'Avez-vous déjà obtenu une offre ou préqualification d\'une autre institution ?',
    type: 'select',
    required: true,
    options: [
      'Oui, mais je veux voir si vous pouvez battre leur taux',
      'Oui, j\'ai déjà commencé avec un autre courtier mais je souhaite un meilleur service',
      'Non, je veux explorer mes options avec vous'
    ]
  },
  {
    id: 'documents_financiers',
    section: 'Bilan',
    question: 'Avez-vous déjà rassemblé certains documents financiers ?',
    type: 'select',
    required: true,
    options: [
      'Oui, j\'ai possiblement déjà tout ou une partie prête',
      'Pas encore, mais je vais le faire dès que possible',
      'Je dois régler cela rapidement, j\'ai un délai à respecter'
    ]
  },
  {
    id: 'date_limite',
    section: 'Bilan',
    question: 'Avez-vous une date limite pour finaliser votre financement ?',
    type: 'select',
    required: true,
    options: [
      'Date précise (ex: dans 3-4 mois)',
      'Non, je regarde juste mes options',
      'Je veux juste me faire qualifier',
      'Pas de stress, c\'est pour dans plus de 6 mois',
      'Je ne suis pas pressé(e), je cherche le taux le plus bas'
    ]
  },
  {
    id: 'date_limite_precise',
    section: 'Bilan',
    question: 'Indiquez la date limite',
    type: 'date',
    required: true,
    condition: (answers) => answers.date_limite === 'Date précise (ex: dans 3-4 mois)'
  },

  // SECTION 3: Informations personnelles
  {
    id: 'titre_politesse',
    section: 'Informations personnelles',
    question: 'Titre de politesse',
    type: 'select',
    required: true,
    options: ['Mr.', 'Mme.']
  },
  {
    id: 'prenom',
    section: 'Informations personnelles',
    question: 'Quel est votre prénom ?',
    type: 'text',
    required: true,
    placeholder: 'Votre prénom'
  },
  {
    id: 'nom',
    section: 'Informations personnelles',
    question: 'Quel est votre nom ?',
    type: 'text',
    required: true,
    placeholder: 'Votre nom'
  },
  {
    id: 'date_naissance',
    section: 'Informations personnelles',
    question: 'Date de naissance',
    type: 'date',
    required: true
  },
  {
    id: 'etat_civil',
    section: 'Informations personnelles',
    question: 'État civil',
    type: 'select',
    required: true,
    options: ['Célibataire', 'Marié', 'Divorcé', 'Séparé', 'Conjoint de fait', 'Veuf/Veuve']
  },
  {
    id: 'regime_matrimonial',
    section: 'Informations personnelles',
    question: 'Type de régime matrimonial',
    type: 'select',
    required: true,
    condition: (answers) => answers.etat_civil === 'Marié',
    options: ['Société d\'acquêts', 'Séparation de biens', 'Communauté de biens']
  },
  {
    id: 'situation_veuf',
    section: 'Informations personnelles',
    question: 'Pour Veuf/Veuve, précisez votre situation',
    type: 'select',
    required: true,
    condition: (answers) => answers.etat_civil === 'Veuf/Veuve',
    options: ['Je reçois un montant régulier', 'Je ne reçois pas de montant']
  },
  {
    id: 'telephone',
    section: 'Informations personnelles',
    question: 'Numéro de téléphone',
    type: 'tel',
    required: true,
    placeholder: '(514) 555-1234'
  },
  {
    id: 'courriel',
    section: 'Informations personnelles',
    question: 'Adresse courriel',
    type: 'email',
    required: true,
    placeholder: 'vous@exemple.com'
  },
  {
    id: 'resident_canada',
    section: 'Informations personnelles',
    question: 'Statut de résidence au Canada',
    type: 'select',
    required: true,
    options: ['Citoyen', 'Résident', 'Immigrant reçu', 'Étranger', 'Visa Étudiant', 'Visa de travail', 'Non résident']
  },
  {
    id: 'nouvel_arrivant',
    section: 'Informations personnelles',
    question: 'Êtes-vous un nouvel arrivant au Canada ?',
    type: 'select',
    required: true,
    options: ['Oui', 'Non']
  },
  {
    id: 'premier_acheteur',
    section: 'Informations personnelles',
    question: 'Êtes-vous un nouvel acheteur (première propriété) ?',
    type: 'select',
    required: true,
    options: ['Oui', 'Non']
  },

  // SECTION 4: Emploi
  {
    id: 'arret_travail',
    section: 'Emploi',
    question: 'Êtes-vous présentement en arrêt de travail ?',
    type: 'select',
    required: true,
    options: ['Oui', 'Non']
  },
  {
    id: 'cause_arret',
    section: 'Emploi',
    question: 'Cause de l\'arrêt ?',
    type: 'select',
    required: true,
    condition: (answers) => answers.arret_travail === 'Oui',
    options: ['Maladie', 'Maternité/paternité']
  },
  {
    id: 'duree_arret',
    section: 'Emploi',
    question: 'Durée de l\'arrêt ?',
    type: 'select',
    required: true,
    condition: (answers) => answers.arret_travail === 'Oui',
    options: ['Courte durée', 'Longue durée']
  },
  {
    id: 'assurance_emploi',
    section: 'Emploi',
    question: 'Avez-vous eu recours à de l\'assurance-emploi ?',
    type: 'select',
    required: true,
    options: ['Non', 'Oui']
  },
  {
    id: 'raison_assurance_emploi',
    section: 'Emploi',
    question: 'Pourquoi avez-vous eu recours à l\'assurance-emploi ?',
    type: 'textarea',
    required: true,
    condition: (answers) => answers.assurance_emploi === 'Oui',
    placeholder: 'Expliquez brièvement...'
  },

  // SECTION 5: Revenus
  {
    id: 'revenu_retraite',
    section: 'Revenus',
    question: 'Avez-vous un revenu de retraite ?',
    type: 'select',
    required: true,
    options: ['Oui', 'Non']
  },
  {
    id: 'revenu_employe',
    section: 'Revenus',
    question: 'Avez-vous un revenu en tant qu\'employé ?',
    type: 'select',
    required: true,
    options: ['Oui', 'Non']
  },
  {
    id: 'revenu_travailleur_autonome',
    section: 'Revenus',
    question: 'Avez-vous un revenu de travailleur autonome et/ou entrepreneur ?',
    type: 'select',
    required: true,
    options: ['Oui', 'Non']
  },
  {
    id: 'type_revenu_autonome',
    section: 'Revenus',
    question: 'Quel type de revenu avez-vous en tant que travailleur autonome ?',
    type: 'select',
    required: true,
    condition: (answers) => answers.revenu_travailleur_autonome === 'Oui',
    options: ['Dividendes', 'Je me tire un salaire', 'Je me tire un salaire et je me verse des dividendes']
  },

  // SECTION 6: Passifs
  {
    id: 'a_dettes',
    section: 'Passifs',
    question: 'Détenez-vous des dettes ?',
    type: 'select',
    required: true,
    options: ['Oui', 'Non']
  },

  // SECTION 7: Faillite/Crédit
  {
    id: 'faillite_proposition',
    section: 'Crédit',
    question: 'Avez-vous déjà déclaré faillite ou fait une proposition au consommateur ?',
    type: 'select',
    required: true,
    options: [
      'Oui, j\'ai fait une faillite depuis moins de 10 ans',
      'Oui, j\'ai fait une proposition au consommateur depuis moins de 10 ans',
      'Oui, j\'ai déjà fait faillite ou proposition mais ça fait plus de 10 ans',
      'Non jamais'
    ]
  },
  {
    id: 'montant_faillite',
    section: 'Crédit',
    question: 'Montant de la faillite ou proposition au consommateur',
    type: 'number',
    required: true,
    condition: (answers) => answers.faillite_proposition !== 'Non jamais',
    placeholder: '$ Montant'
  },
  {
    id: 'date_declaree',
    section: 'Crédit',
    question: 'Date déclarée',
    type: 'date',
    required: true,
    condition: (answers) => answers.faillite_proposition !== 'Non jamais'
  },
  {
    id: 'date_liberation',
    section: 'Crédit',
    question: 'Date de libération',
    type: 'date',
    required: true,
    condition: (answers) => answers.faillite_proposition !== 'Non jamais'
  },
  {
    id: 'connait_score_credit',
    section: 'Crédit',
    question: 'Connaissez-vous votre score de crédit approximatif ?',
    type: 'select',
    required: true,
    options: ['Oui', 'Non']
  },
  {
    id: 'score_credit',
    section: 'Crédit',
    question: 'Score approximatif',
    type: 'number',
    required: true,
    condition: (answers) => answers.connait_score_credit === 'Oui',
    placeholder: 'Ex: 720'
  },
  {
    id: 'paiements_manques',
    section: 'Crédit',
    question: 'Avez-vous déjà manqué des paiements dans les 4 dernières années ?',
    type: 'select',
    required: true,
    options: ['Oui', 'Non']
  },

  // SECTION 8: Propriétés
  {
    id: 'a_proprietes',
    section: 'Propriétés',
    question: 'Détenez-vous une/des propriétés à votre nom personnel ?',
    type: 'select',
    required: true,
    options: ['Oui', 'Non']
  },

  // SECTION 9: Assurances
  {
    id: 'conseiller_assurance_vie',
    section: 'Assurances',
    question: 'Avez-vous déjà un conseiller en sécurité financière pour vos assurances-vie ?',
    type: 'select',
    required: true,
    options: [
      'J\'ai déjà mon conseiller en sécurité financière',
      'J\'aimerais regarder les options et avoir les conseils d\'un professionnel',
      'Je ne veux pas magasiner d\'assurance-vie',
      'Je préfère prendre l\'assurance proposée par le nouveau prêteur'
    ]
  },
  {
    id: 'courtier_assurance_habitation',
    section: 'Assurances',
    question: 'Avez-vous un courtier en assurance habitation ?',
    type: 'select',
    required: true,
    options: [
      'Svp référez-moi un courtier pour faire un choix économique',
      'J\'ai déjà contacté un assureur'
    ]
  },

  // SECTION 10: Propriété à refinancer (conditionnel)
  {
    id: 'solde_hypothecaire',
    section: 'Propriété à refinancer',
    question: 'Quel est votre solde hypothécaire actuel ?',
    type: 'number',
    required: true,
    condition: (answers) => answers.type_demande?.includes('Refinancement'),
    placeholder: '$ Montant'
  },
  {
    id: 'montant_versement',
    section: 'Propriété à refinancer',
    question: 'Montant du versement hypothécaire actuel',
    type: 'number',
    required: true,
    condition: (answers) => answers.type_demande?.includes('Refinancement'),
    placeholder: '$ Montant'
  },
  {
    id: 'type_versement',
    section: 'Propriété à refinancer',
    question: 'Type de versement',
    type: 'select',
    required: true,
    condition: (answers) => answers.type_demande?.includes('Refinancement'),
    options: ['Hebdomadaire', 'Aux 2 semaines', 'Mensuel', 'Bi-mensuel']
  },
  {
    id: 'valeur_marche',
    section: 'Propriété à refinancer',
    question: 'Valeur estimée de votre propriété (valeur marché actuel)',
    type: 'number',
    required: true,
    condition: (answers) => answers.type_demande?.includes('Refinancement'),
    placeholder: '$ Montant'
  },
  {
    id: 'annee_construction',
    section: 'Propriété à refinancer',
    question: 'Année de construction de la propriété',
    type: 'number',
    required: true,
    condition: (answers) => answers.type_demande?.includes('Refinancement'),
    placeholder: 'Ex: 1995'
  },
  {
    id: 'amortissement_desire',
    section: 'Propriété à refinancer',
    question: 'Amortissement désiré (entre 3 et 30 ans)',
    type: 'number',
    required: true,
    condition: (answers) => answers.type_demande?.includes('Refinancement'),
    placeholder: 'Nombre d\'années'
  },

  // SECTION 11: Nouvel achat (conditionnel)
  {
    id: 'type_mise_fonds',
    section: 'Nouvel achat',
    question: 'Souhaitez-vous mettre un montant fixe en mise de fonds ou le % minimum ?',
    type: 'select',
    required: true,
    condition: (answers) => answers.type_demande?.includes('Nouvel achat'),
    options: [
      'Je ne veux pas mettre plus que la mise de fonds minimale requise',
      'J\'ai un montant fixe que je veux utiliser pour ma mise de fonds'
    ]
  },
  {
    id: 'montant_compte_banque',
    section: 'Nouvel achat',
    question: 'Combien d\'argent avez-vous dans votre compte pour la mise de fonds ?',
    type: 'number',
    required: true,
    condition: (answers) => answers.type_demande?.includes('Nouvel achat'),
    placeholder: '$ Montant (excluant le 1.5% de la valeur)'
  },
  {
    id: 'montant_depuis_3mois',
    section: 'Nouvel achat',
    question: 'Détenez-vous ce montant depuis plus de 3 mois ?',
    type: 'select',
    required: true,
    condition: (answers) => answers.type_demande?.includes('Nouvel achat'),
    options: ['Oui', 'Non']
  }
];


export default function MortgageForm() {
  const [step, setStep] = useState('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scroll reset
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestionIndex, step]);

  const visibleQuestions = useMemo(() => {
    return allQuestions.filter(q => !q.condition || q.condition(answers));
  }, [answers]);

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion?.id] || '';
  
  // Progress calc
  const progress = step === 'intro' ? 0 : step === 'recap' ? 100 : ((currentQuestionIndex + 1) / visibleQuestions.length) * 100;

  // VALIDATIONS
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValid = useMemo(() => {
    if (!currentQuestion) return false;
    const val = answers[currentQuestion.id];
    if (val === undefined || val === '') return false;
    if (currentQuestion.type === 'email') return validateEmail(val);
    if (currentQuestion.type === 'tel') return isPossiblePhoneNumber(val);
    return true;
  }, [answers, currentQuestion]);

  const handleNext = () => {
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setDirection(1);
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setStep('recap');
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setStep('intro');
    }
  };

  const updateAnswer = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  // GÉNÉRATION PDF + ENVOI VIA TON API RESEND
const sendToResend = async () => {
  setIsSubmitting(true);
  try {
    // Créer le document PDF
    const doc = new jsPDF();
    
    // Ajouter le titre
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("NOUVEAU DOSSIER HYPOTHÉCAIRE", 105, 20, { align: 'center' });
    
    // Informations du client
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Nom: ${answers.prenom || ''} ${answers.nom || ''}`, 14, 35);
    doc.text(`Email: ${answers.courriel || ''}`, 14, 42);
    doc.text(`Date de soumission: ${new Date().toLocaleDateString('fr-CA')}`, 14, 49);
    
    // Préparer les données pour le tableau
    const tableData = visibleQuestions.map(q => [
      q.question, 
      answers[q.id] ? String(answers[q.id]) : 'Non renseigné'
    ]);
    
    // Utiliser autoTable CORRECTEMENT
    autoTable(doc, {
      startY: 60,
      head: [['Question', 'Réponse']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [220, 38, 38],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { cellWidth: 90, fontStyle: 'bold' },
        1: { cellWidth: 95 }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: function(data) {
        // Pied de page
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text(
          `Page ${data.pageNumber}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
    });
    
    // Générer le PDF en base64 pour Resend
    const pdfBase64 = doc.output('datauristring').split(',')[1];
    
    // OU alternative plus robuste pour tous les navigateurs :
    // const pdfOutput = doc.output('arraybuffer');
    // const pdfBase64 = btoa(
    //   new Uint8Array(pdfOutput).reduce(
    //     (data, byte) => data + String.fromCharCode(byte),
    //     ''
    //   )
    // );
    
    console.log('Envoi du formulaire...');
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pdf: pdfBase64,
        name: `${answers.prenom || ''} ${answers.nom || ''}`.trim(),
        email: answers.courriel || ''
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Erreur API:', result);
      alert(`Erreur lors de l'envoi: ${result.error || 'Veuillez réessayer'}`);
      return;
    }

    console.log('Succès!', result);
    setStep('success');
    
  } catch (error) {
    console.error('Erreur complète:', error);
    alert("Erreur technique: " + error.message);
  } finally {
    setIsSubmitting(false);
  }
};
  const groupedAnswers = useMemo(() => {
    const groups = {};
    visibleQuestions.forEach(q => {
      const answer = answers[q.id];
      if (answer !== undefined && answer !== '') {
        if (!groups[q.section]) groups[q.section] = [];
        groups[q.section].push({ ...q, answer });
      }
    });
    return groups;
  }, [answers, visibleQuestions]);

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col font-sans antialiased selection:bg-red-500/30">
      
      {/* FIX POUR LE PHONE INPUT (DRAPEAUX ET DROPDOWN) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .PhoneInputCountrySelect { background-color: #000 !important; color: #fff !important; }
        .PhoneInputCountrySelect option { background-color: #000 !important; color: #fff !important; }
        .PhoneInputInput {
          background: transparent !important; border: none !important;
          border-bottom: 2px solid rgba(255,255,255,0.1) !important;
          color: white !important; font-size: inherit !important; outline: none !important;
          padding: 10px 0 !important;
        }
        .PhoneInputInput:focus { border-bottom-color: #dc2626 !important; }
      `}} />

      {/* HEADER */}
      <header className="fixed top-0 w-full z-[100] bg-black/80 backdrop-blur-xl border-b border-white/10 h-16 md:h-20 flex items-center">
        <div className="max-w-5xl mx-auto px-6 w-full flex items-center justify-between">
          <img src="/logo.svg" alt="Logo" className="h-5 md:h-6 w-auto object-contain" />
          <AnimatePresence mode="wait">
            {step === 'questions' && (
              <motion.div key="counter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <span className="text-[10px] md:text-xs font-bold tracking-widest text-white/40 uppercase bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  {currentQuestionIndex + 1} / {visibleQuestions.length}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
          <motion.div className="h-full bg-red-600 shadow-[0_0_12px_rgba(237,34,36,0.8)]" animate={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-20 md:pt-28 pb-32">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
                Votre projet <br className="hidden md:block"/><span className="text-red-600 italic">commence ici.</span>
              </h1>
              <button onClick={() => setStep('questions')} className="group bg-red-600 hover:bg-red-700 text-white px-10 py-4 md:py-5 rounded-full font-bold text-lg flex items-center gap-3 shadow-xl shadow-red-600/20">
                Commencer <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 'questions' && (
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: direction > 0 ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction > 0 ? -30 : 30 }} className="flex-1 flex flex-col w-full max-w-2xl mx-auto px-6">
              <div className="pt-8 flex-1">
                <span className="inline-block text-red-600 font-bold text-[10px] md:text-xs mb-4 uppercase tracking-[0.3em] py-1 px-3 bg-red-600/10 rounded-full">
                  {currentQuestion.section}
                </span>
                <h2 className="text-2xl md:text-4xl font-semibold leading-tight mb-10 tracking-tight">{currentQuestion.question}</h2>

                <div className="space-y-3 mb-8">
                  {currentQuestion.type === 'select' ? (
                    currentQuestion.options.map((opt) => (
                      <button key={opt} onClick={() => { updateAnswer(currentQuestion.id, opt); setTimeout(handleNext, 350); }}
                        className={`w-full text-left p-5 md:p-6 rounded-2xl border-2 transition-all flex justify-between items-center group active:scale-[0.98] ${currentAnswer === opt ? 'border-red-600 bg-red-600/10' : 'border-white/5 bg-white/[0.03] hover:border-white/20'}`}>
                        <span className="text-base md:text-lg pr-4">{opt}</span>
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${currentAnswer === opt ? 'bg-red-600 border-red-600' : 'border-white/10 group-hover:border-white/30'}`}>
                          {currentAnswer === opt && <Check className="text-white w-3 h-3" strokeWidth={4} />}
                        </div>
                      </button>
                    ))
                  ) : currentQuestion.type === 'tel' ? (
                    <div className="mt-4">
                      <PhoneInput international defaultCountry="CA" value={currentAnswer} onChange={(v) => updateAnswer(currentQuestion.id, v || '')} className="text-2xl md:text-4xl" />
                    </div>
                  ) : (
                    <div className="relative mt-4">
                      <input autoFocus type={currentQuestion.type} value={currentAnswer} placeholder={currentQuestion.placeholder} onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)} 
                        className={`w-full bg-transparent border-b-2 py-5 text-2xl md:text-4xl focus:outline-none transition-colors placeholder:text-white/5 ${currentQuestion.type === 'email' && currentAnswer && !validateEmail(currentAnswer) ? 'border-orange-500' : 'border-white/10 focus:border-red-600'}`}
                        onKeyDown={(e) => e.key === 'Enter' && isValid && handleNext()} />
                    </div>
                  )}
                </div>
              </div>

              <div className="py-8 flex items-center justify-between border-t border-white/5 mt-auto">
                <button onClick={handlePrev} className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white/60 transition-all text-sm font-bold"><ChevronLeft size={18} /> Précédent</button>
                {currentQuestion.type !== 'select' && (
                  <button onClick={handleNext} disabled={!isValid} className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all text-sm ${isValid ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}`}>Suivant <ChevronRight size={18} /></button>
                )}
              </div>
            </motion.div>
          )}

          {step === 'recap' && (
            <motion.div key="recap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto w-full px-6">
              <div className="mb-10 text-center md:text-left pt-6">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Récapitulatif</h2>
                <p className="text-white/40 text-sm md:text-base">Vérifiez vos détails. Touchez une réponse pour la modifier.</p>
              </div>
              
              <div className="space-y-10 mb-20">
                {Object.entries(groupedAnswers).map(([section, items]) => (
                  <div key={section}>
                    <h3 className="text-red-600 font-bold mb-4 uppercase text-[10px] tracking-[0.2em] ml-2 opacity-80">{section}</h3>
                    <div className="bg-white/[0.02] rounded-[24px] md:rounded-[32px] border border-white/5 divide-y divide-white/5 overflow-hidden shadow-2xl shadow-black/40">
                      {items.map((item) => (
                        <div key={item.id} onClick={() => setEditingQuestion(item)} className="flex items-center justify-between p-5 md:p-6 cursor-pointer hover:bg-white/[0.06] transition-all group active:bg-white/[0.08]">
                          <div className="flex-1 pr-6">
                            <p className="text-white/30 text-[10px] md:text-xs mb-1 uppercase font-bold tracking-wider">{item.question}</p>
                            <p className="text-base md:text-lg font-medium text-white/90 group-hover:text-white transition-colors line-clamp-2 leading-snug">{item.answer}</p>
                          </div>
                          <div className="p-2 md:p-3 bg-white/5 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all">
                            <Edit2 size={16} className="md:w-[18px] md:h-[18px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/95 to-transparent z-[80] flex justify-center">
                <button onClick={sendToResend} disabled={isSubmitting} className="w-full max-w-2xl bg-red-600 py-5 rounded-2xl font-bold text-lg md:text-xl shadow-2xl shadow-red-600/40 flex items-center justify-center gap-3">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Soumettre ma demande'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center px-6">
               <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20"><Check size={40} strokeWidth={3} /></div>
               <h2 className="text-4xl font-bold mb-2 tracking-tight">C'est envoyé !</h2>
               <p className="text-white/50 text-lg">Nous avons bien reçu vos informations.</p>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* MODAL D'ÉDITION */}
      <AnimatePresence>
        {editingQuestion && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
            <motion.div className="absolute inset-0 bg-black/90 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingQuestion(null)} />
            <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative bg-[#0F0F0F] border-t md:border border-white/10 p-6 md:p-10 rounded-t-[32px] md:rounded-[40px] w-full max-w-xl shadow-2xl flex flex-col">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 md:hidden" />
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-red-600 font-bold text-[10px] mb-2 uppercase tracking-widest">{editingQuestion.section}</p>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight pr-4">{editingQuestion.question}</h3>
                </div>
                <button onClick={() => setEditingQuestion(null)} className="flex-shrink-0 p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/40"><X size={20}/></button>
              </div>
              <div className="space-y-3 pb-6">
                {editingQuestion.type === 'select' ? (
                  editingQuestion.options.map(opt => (
                    <button key={opt} onClick={() => { updateAnswer(editingQuestion.id, opt); setEditingQuestion(null); }} className={`w-full text-left p-5 rounded-2xl border transition-all ${answers[editingQuestion.id] === opt ? 'border-red-600 bg-red-600/10 text-white' : 'border-white/10 bg-white/5 text-white/60'}`}>{opt}</button>
                  ))
                ) : (
                  <div className="space-y-6">
                    <input autoFocus className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-lg md:text-xl outline-none focus:border-red-600" value={answers[editingQuestion.id] || ''} onChange={(e) => updateAnswer(editingQuestion.id, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setEditingQuestion(null)} />
                    <button onClick={() => setEditingQuestion(null)} className="w-full bg-white text-black py-4 rounded-2xl font-bold text-lg">Enregistrer</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}