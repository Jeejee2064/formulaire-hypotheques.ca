'use client'
import { useState, useEffect } from 'react'


const initialQuestions = [
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


function createConditionString(conditionData) {
  if (!conditionData || !conditionData.dependsOn) return undefined;
  
  const { dependsOn, operator, value } = conditionData;
  
  if (operator === "===") {
    return `(answers) => answers.${dependsOn} === '${value}'`;
  } else if (operator === "!==") {
    return `(answers) => answers.${dependsOn} !== '${value}'`;
  } else if (operator === "includes") {
    return `(answers) => answers.${dependsOn}?.includes('${value}')`;
  }
  return undefined;
}

// Helper to extract conditionData from existing condition functions
function extractConditionData(conditionFn) {
  if (!conditionFn) return null;
  
  const txt = conditionFn.toString();
  
  // answers.x === 'Y'
  let match = txt.match(/answers\.([a-zA-Z0-9_]+)\s*===\s*['"`](.+?)['"`]/);
  if (match) {
    return {
      dependsOn: match[1],
      operator: '===',
      value: match[2]
    };
  }
  
  // answers.x !== 'Y'
  match = txt.match(/answers\.([a-zA-Z0-9_]+)\s*!==\s*['"`](.+?)['"`]/);
  if (match) {
    return {
      dependsOn: match[1],
      operator: '!==',
      value: match[2]
    };
  }
  
  // answers.x?.includes('Y')
  match = txt.match(/answers\.([a-zA-Z0-9_]+)\?\.includes\(['"`](.+?)['"`]\)/);
  if (match) {
    return {
      dependsOn: match[1],
      operator: 'includes',
      value: match[2]
    };
  }
  
  return null;
}

export default function QuestionnaireEditor() {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    section: '', question: '', type: 'text', required: true, options: []
  });

  // Initialize questions with conditionData
  useEffect(() => {
    const initializedQuestions = questions.map(q => ({
      ...q,
      conditionData: extractConditionData(q.condition)
    }));
    setQuestions(initializedQuestions);
  }, []);

  const updateQuestion = (index, updates) => {
    const copy = [...questions];
    copy[index] = { ...copy[index], ...updates };
    setQuestions(copy);
  };

  const addOption = (qIndex) => {
    const copy = [...questions];
    copy[qIndex].options = [...(copy[qIndex].options || []), "Nouvelle option"];
    setQuestions(copy);
  };

  const removeQuestion = (index) => {
    if(confirm("Supprimer cette question ?")) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleAddNewQuestion = () => {
    const id = newQuestion.question.toLowerCase().replace(/\s+/g, '_').substring(0, 20) + "_" + Date.now();
    const newQ = { ...newQuestion, id };
    newQ.conditionData = null;
    setQuestions([...questions, newQ]);
    setIsModalOpen(false);
    setNewQuestion({ section: '', question: '', type: 'text', required: true, options: [] });
  };

const copyJSON = () => {
  const questionStrings = questions.map(q => {
    // Construction de l'objet de base
    let obj = `  {
    id: "${q.id}",
    section: "${q.section}",
    question: "${q.question.replace(/"/g, '\\"')}",
    type: "${q.type}",
    required: ${q.required}`;

    // Ajouter placeholder si présent
    if (q.placeholder) {
      obj += `,
    placeholder: "${q.placeholder}"`;
    }

    // Ajouter options si présent (pour les select)
    if (q.options && q.options.length > 0) {
      obj += `,
    options: ${JSON.stringify(q.options)}`;
    }

    // Ajouter la condition SI ELLE EXISTE (depuis conditionData)
    if (q.conditionData && q.conditionData.dependsOn && q.conditionData.value) {
      const { dependsOn, operator, value } = q.conditionData;
      
      let conditionCode = '';
      if (operator === '===') {
        conditionCode = `(answers) => answers.${dependsOn} === '${value}'`;
      } else if (operator === '!==') {
        conditionCode = `(answers) => answers.${dependsOn} !== '${value}'`;
      } else if (operator === 'includes') {
        conditionCode = `(answers) => answers.${dependsOn}?.includes('${value}')`;
      }
      
      if (conditionCode) {
        obj += `,
    condition: ${conditionCode}`;
      }
    }

    // Fermer l'objet
    obj += '\n  }';
    return obj;
  });

  // Générer le code complet
  const finalCode = `const allQuestions = [
${questionStrings.join(',\n')}
];`;

  // Copier dans le presse-papier
  navigator.clipboard.writeText(finalCode);
  alert('✅ Code avec conditions copié !');
};
  const sections = [...new Set(questions.map(q => q.section))];

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-5xl">
        
        {/* HEADER */}
        <div className="mb-10 flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">🧠 Éditeur de Questionnaire</h1>
            <p className="text-slate-500">Gérez vos questions et la logique conditionnelle</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-100"
            >
              + Ajouter une question
            </button>
            <button 
              onClick={copyJSON}
              className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium transition-all"
            >
              📋 COPIER LE JSON COMPLET (AVEC CONDITIONS)
            </button>
          </div>
        </div>

        {/* IMPORTANT NOTICE */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-yellow-800 text-sm font-medium">
            ⚠️ <strong>Important:</strong> Quand vous copiez le JSON, assurez-vous de remplacer le <code>allQuestions</code> dans votre formulaire principal. 
            Les fonctions condition seront correctement générées.
          </p>
        </div>

        {/* LISTE DES SECTIONS */}
        {sections.map(section => (
          <div key={section} className="mb-12">
            <h2 className="text-lg font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">{section}</h2>
            
            <div className="space-y-4">
              {questions.map((q, i) => {
                if (q.section !== section) return null;
                return (
                  <div key={q.id} className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">ID: {q.id}</span>
                      <button onClick={() => removeQuestion(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Contenu principal */}
                      <div className="md:col-span-7 space-y-4">
                        <input
                          className="w-full text-lg font-medium border-none focus:ring-0 p-0 placeholder:text-slate-300"
                          value={q.question}
                          onChange={e => updateQuestion(i, { question: e.target.value })}
                          placeholder="Écrivez votre question ici..."
                        />
                        
                        <div className="flex gap-4">
                          <select 
                            className="bg-slate-50 border border-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                            value={q.type}
                            onChange={e => updateQuestion(i, { type: e.target.value })}
                          >
                            <option value="text">Texte</option>
                            <option value="number">Nombre</option>
                            <option value="select">Choix multiple</option>
                            <option value="date">Date</option>
                            <option value="tel">Téléphone</option>
                          </select>

                          <label className="inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={q.required}
                              onChange={e => updateQuestion(i, { required: e.target.checked })}
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            <span className="ms-3 text-sm font-medium text-slate-600">Obligatoire</span>
                          </label>
                        </div>

                        {/* Options si Select */}
                        {q.type === 'select' && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Options de réponse</p>
                            {q.options?.map((opt, oIdx) => (
                              <input
                                key={oIdx}
                                className="w-full mb-2 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                                value={opt}
                                onChange={e => {
                                  const newOpts = [...q.options];
                                  newOpts[oIdx] = e.target.value;
                                  updateQuestion(i, { options: newOpts });
                                }}
                              />
                            ))}
                            <button onClick={() => addOption(i)} className="text-indigo-600 text-sm font-semibold hover:underline">+ Ajouter une option</button>
                          </div>
                        )}
                      </div>

                      {/* Logique conditionnelle */}
                      <div className="md:col-span-5 border-l border-slate-100 pl-6">
                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                          <h4 className="text-xs font-bold text-indigo-900 uppercase mb-3 flex items-center gap-2">
                            🧩 Condition d'affichage
                          </h4>
                          
                          <select 
                            className="w-full text-xs bg-white border border-indigo-200 rounded-md p-2 mb-2"
                            value={q.conditionData?.dependsOn || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                updateQuestion(i, { conditionData: null });
                              } else {
                                updateQuestion(i, { 
                                  conditionData: { 
                                    dependsOn: val, 
                                    operator: "===", 
                                    value: "" 
                                  } 
                                });
                              }
                            }}
                          >
                            <option value="">Toujours afficher</option>
                            {questions.filter(item => item.id !== q.id).map(item => (
                              <option key={item.id} value={item.id}>
                                Si : {item.question.substring(0, 40)}...
                              </option>
                            ))}
                          </select>

                          {q.conditionData && (
                            <>
                              <div className="flex gap-2 mb-2">
                                <select 
                                  className="text-xs bg-white border border-indigo-200 rounded-md p-2"
                                  value={q.conditionData.operator}
                                  onChange={e => updateQuestion(i, { 
                                    conditionData: { ...q.conditionData, operator: e.target.value }
                                  })}
                                >
                                  <option value="===">est égal à</option>
                                  <option value="!==">est différent de</option>
                                  <option value="includes">contient</option>
                                </select>
                                <input 
                                  className="w-full text-xs bg-white border border-indigo-200 rounded-md p-2"
                                  placeholder="Valeur..."
                                  value={q.conditionData.value}
                                  onChange={e => updateQuestion(i, { 
                                    conditionData: { ...q.conditionData, value: e.target.value }
                                  })}
                                />
                              </div>
                              <div className="text-xs text-slate-500 p-2 bg-white rounded border">
                                <strong>Fonction générée:</strong><br/>
                                <code className="text-[10px]">
                                  {createConditionString(q.conditionData)?.replace('(answers) => ', '')}
                                </code>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL AJOUT QUESTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 transform transition-all">
            <h3 className="text-xl font-bold mb-6">Nouvelle question</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                <input 
                  list="sections-list"
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  onChange={e => setNewQuestion({...newQuestion, section: e.target.value})}
                />
                <datalist id="sections-list">
                  {sections.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">La question</label>
                <input 
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                  placeholder="Ex: Quel est votre revenu ?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type de réponse</label>
                <select 
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  onChange={e => setNewQuestion({...newQuestion, type: e.target.value})}
                >
                  <option value="text">Texte libre</option>
                  <option value="select">Choix multiples</option>
                  <option value="number">Nombre</option>
                  <option value="date">Date</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={handleAddNewQuestion}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Créer la question
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icone simple
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);