'use client'
import { useState, useEffect, useRef } from 'react'

const allQuestions = [
  {
    id: "type_demande",
    section: "Type de demande",
    question: "Quel type de demande souhaitez-vous faire ?",
    type: "select",
    required: true,
    options: ["Refinancement/Renouvellement hypothécaire sans changements", "Refinancement/Renouvellement avec ajout d'un montant", "Nouvel achat propriétaire occupant", "Nouvel achat duplex et + propriétaire occupant et locatif", "Nouvel achat 100% locatif"]
  },
  {
    id: "processus_financement",
    section: "Bilan",
    question: "Où en êtes-vous dans votre processus de financement ?",
    type: "select",
    required: true,
    options: ["J'ai déjà commencé à me renseigner mais je n'ai pas reçu un super deal", "Je veux un taux qui fonctionne et je suis prêt(e) à avancer", "Je veux de l'aide avec un accompagnement personnalisé", "J'ai déjà une préqualification ou offre verbale", "Je n'ai pas encore regardé, mais je veux qu'on m'en propose mieux", "J'ai été référé(e) et j'ai entendu du bien du courtier"]
  },
  {
    id: "importance_financement",
    section: "Bilan",
    question: "Quel est le plus important pour vous dans votre financement hypothécaire ?",
    type: "select",
    required: true,
    options: ["Le service, l'accompagnement et une solution adaptée", "Le taux le plus bas, peu importe le reste"]
  },
  {
    id: "pret_avancer",
    section: "Bilan",
    question: "Si nous trouvons une offre avantageuse parmi 2-3 offres, seriez-vous prêt à aller de l'avant ?",
    type: "select",
    required: true,
    options: ["Oui, si c'est la meilleure option pour moi", "Je préfère voir plusieurs offres avant de me décider", "Seulement si vous pouvez battre l'offre que j'ai déjà reçue", "Oui, avec un bon service et accompagnement", "Peut-être, mais je vais aussi voir ailleurs"]
  },
  {
    id: "offre_existante",
    section: "Bilan",
    question: "Avez-vous déjà obtenu une offre ou préqualification d'une autre institution ?",
    type: "select",
    required: true,
    options: ["Oui, mais je veux voir si vous pouvez battre leur taux", "Oui, j'ai déjà commencé avec un autre courtier mais je souhaite un meilleur service", "Non, je veux explorer mes options avec vous"]
  },
  {
    id: "documents_financiers",
    section: "Bilan",
    question: "Avez-vous déjà rassemblé certains documents financiers ?",
    type: "select",
    required: true,
    options: ["Oui, j'ai possiblement déjà tout ou une partie prête", "Pas encore, mais je vais le faire dès que possible", "Je dois régler cela rapidement, j'ai un délai à respecter"]
  },
  {
    id: "date_limite",
    section: "Bilan",
    question: "Avez-vous une date limite pour finaliser votre financement ?",
    type: "select",
    required: true,
    options: ["Date précise (ex: dans 3-4 mois)", "Non, je regarde juste mes options", "Je veux juste me faire qualifier", "Pas de stress, c'est pour dans plus de 6 mois", "Je ne suis pas pressé(e), je cherche le taux le plus bas"]
  },
  {
    id: "date_limite_precise",
    section: "Bilan",
    question: "Indiquez la date limite",
    type: "date",
    required: true,
    condition: { field: "date_limite", value: "Date précise (ex: dans 3-4 mois)" }
  },
  {
    id: "titre_politesse",
    section: "Informations personnelles",
    question: "Titre de politesse",
    type: "select",
    required: true,
    options: ["Mr.", "Mme."]
  },
  {
    id: "prenom",
    section: "Informations personnelles",
    question: "Quel est votre prénom ?",
    type: "text",
    required: true,
    placeholder: "Votre prénom"
  },
  {
    id: "nom",
    section: "Informations personnelles",
    question: "Quel est votre nom ?",
    type: "text",
    required: true,
    placeholder: "Votre nom"
  },
  {
    id: "date_naissance",
    section: "Informations personnelles",
    question: "Date de naissance",
    type: "date",
    required: true
  },
  {
    id: "etat_civil",
    section: "Informations personnelles",
    question: "État civil",
    type: "select",
    required: true,
    options: ["Célibataire", "Marié", "Divorcé", "Séparé", "Conjoint de fait", "Veuf/Veuve"]
  },
  {
    id: "regime_matrimonial",
    section: "Informations personnelles",
    question: "Type de régime matrimonial",
    type: "select",
    required: true,
    options: ["Société d'acquêts", "Séparation de biens", "Communauté de biens"],
    condition: { field: "etat_civil", value: "Marié" }
  },
  {
    id: "situation_veuf",
    section: "Informations personnelles",
    question: "Pour Veuf/Veuve, précisez votre situation",
    type: "select",
    required: true,
    options: ["Je reçois un montant régulier", "Je ne reçois pas de montant"],
    condition: { field: "etat_civil", value: "Veuf/Veuve" }
  },
  {
    id: "telephone",
    section: "Informations personnelles",
    question: "Numéro de téléphone",
    type: "tel",
    required: true,
    placeholder: "(514) 555-1234"
  },
  {
    id: "courriel",
    section: "Informations personnelles",
    question: "Adresse courriel",
    type: "email",
    required: true,
    placeholder: "vous@exemple.com"
  },
  {
    id: "resident_canada",
    section: "Informations personnelles",
    question: "Statut de résidence au Canada",
    type: "select",
    required: true,
    options: ["Citoyen", "Résident", "Immigrant reçu", "Étranger", "Visa Étudiant", "Visa de travail", "Non résident"]
  },
  {
    id: "nouvel_arrivant",
    section: "Informations personnelles",
    question: "Êtes-vous un nouvel arrivant au Canada ?",
    type: "select",
    required: true,
    options: ["Oui", "Non"]
  },
  {
    id: "premier_acheteur",
    section: "Informations personnelles",
    question: "Êtes-vous un nouvel acheteur (première propriété) ?",
    type: "select",
    required: true,
    options: ["Oui", "Non"]
  },
  {
    id: "arret_travail",
    section: "Emploi",
    question: "Êtes-vous présentement en arrêt de travail ?",
    type: "select",
    required: true,
    options: ["Oui", "Non"]
  },
  {
    id: "cause_arret",
    section: "Emploi",
    question: "Cause de l'arrêt ?",
    type: "select",
    required: true,
    options: ["Maladie", "Maternité/paternité"],
    condition: { field: "arret_travail", value: "Oui" }
  },
  {
    id: "duree_arret",
    section: "Emploi",
    question: "Durée de l'arrêt ?",
    type: "select",
    required: true,
    options: ["Courte durée", "Longue durée"],
    condition: { field: "arret_travail", value: "Oui" }
  },
  {
    id: "assurance_emploi",
    section: "Emploi",
    question: "Avez-vous eu recours à de l'assurance-emploi ?",
    type: "select",
    required: true,
    options: ["Oui", "Non"]
  },
  {
    id: "raison_assurance_emploi",
    section: "Emploi",
    question: "Pourquoi avez-vous eu recours à l'assurance-emploi ?",
    type: "textarea",
    required: true,
    placeholder: "Expliquez brièvement...",
    condition: { field: "assurance_emploi", value: "Oui" }
  },
  {
    id: "revenu_retraite",
    section: "Revenus",
    question: "Avez-vous un revenu de retraite ?",
    type: "select",
    required: true,
    options: ["Oui", "Non"]
  },
  {
    id: "revenu_employe",
    section: "Revenus",
    question: "Avez-vous un revenu en tant qu'employé ?",
    type: "select",
    required: true,
    options: ["Oui", "Non"]
  },
  {
    id: "revenu_travailleur_autonome",
    section: "Revenus",
    question: "Avez-vous un revenu de travailleur autonome et/ou entrepreneur ?",
    type: "select",
    required: true,
    options: ["Oui", "Non"]
  },
  {
    id: "type_revenu_autonome",
    section: "Revenus",
    question: "Quel type de revenu avez-vous en tant que travailleur autonome ?",
    type: "select",
    required: true,
    options: ["Dividendes", "Je me tire un salaire", "Je me tire un salaire et je me verse des dividendes"],
    condition: { field: "revenu_travailleur_autonome", value: "Oui" }
  },
  {
    id: "a_dettes",
    section: "Passifs",
    question: "Détenez-vous des dettes ?",
    type: "select",
    required: true,
    options: ["Oui", "Non"]
  },
  {
    id: "faillite_proposition",
    section: "Crédit",
    question: "Avez-vous déjà déclaré faillite ou fait une proposition au consommateur ?",
    type: "select",
    required: true,
    options: ["Oui, j'ai fait une faillite depuis moins de 10 ans", "Oui, j'ai fait une proposition au consommateur depuis moins de 10 ans", "Oui, j'ai déjà fait faillite ou proposition mais ça fait plus de 10 ans", "Non jamais"]
  },
  {
    id: "montant_faillite",
    section: "Crédit",
    question: "Montant de la faillite ou proposition au consommateur",
    type: "number",
    required: true,
    placeholder: "$ Montant",
    condition: { field: "faillite_proposition", not: "Non jamais" }
  },
  {
    id: "date_declaree",
    section: "Crédit",
    question: "Date déclarée",
    type: "date",
    required: true,
    condition: { field: "faillite_proposition", not: "Non jamais" }
  },
  {
    id: "date_liberation",
    section: "Crédit",
    question: "Date de libération",
    type: "date",
    required: true,
    condition: { field: "faillite_proposition", not: "Non jamais" }
  },
  {
    id: "connait_score_credit",
    section: "Crédit",
    question: "Connaissez-vous votre score de crédit approximatif ?",
    type: "select",
    required: true,
    options: ["Oui", "Non"]
  },
  {
    id: "score_credit",
    section: "Crédit",
    question: "Score approximatif",
    type: "number",
    required: true,
    placeholder: "Ex: 720",
    condition: { field: "connait_score_credit", value: "Oui" }
  },
  {
    id: "paiements_manques",
    section: "Crédit",
    question: "Avez-vous déjà manqué des paiements dans les 4 dernières années ?",
    type: "select",
    required: true,
    options: ["Oui", "Non"]
  },
  {
    id: "a_proprietes",
    section: "Propriétés",
    question: "Détenez-vous une/des propriétés à votre nom personnel ?",
    type: "select",
    required: true,
    options: ["Oui", "Non"]
  },
  {
    id: "conseiller_assurance_vie",
    section: "Assurances",
    question: "Avez-vous déjà un conseiller en sécurité financière pour vos assurances-vie ?",
    type: "select",
    required: true,
    options: ["J'ai déjà mon conseiller en sécurité financière", "J'aimerais regarder les options et avoir les conseils d'un professionnel", "Je ne veux pas magasiner d'assurance-vie", "Je préfère prendre l'assurance proposée par le nouveau prêteur"]
  },
  {
    id: "courtier_assurance_habitation",
    section: "Assurances",
    question: "Avez-vous un courtier en assurance habitation ?",
    type: "select",
    required: true,
    options: ["Svp référez-moi un courtier pour faire un choix économique", "J'ai déjà contacté un assureur"]
  },
  {
    id: "solde_hypothecaire",
    section: "Propriété à refinancer",
    question: "Quel est votre solde hypothécaire actuel ?",
    type: "number",
    required: true,
    placeholder: "$ Montant",
    condition: { field: "type_demande", includes: "Refinancement" }
  },
  {
    id: "montant_versement",
    section: "Propriété à refinancer",
    question: "Montant du versement hypothécaire actuel",
    type: "number",
    required: true,
    placeholder: "$ Montant",
    condition: { field: "type_demande", includes: "Refinancement" }
  },
  {
    id: "type_versement",
    section: "Propriété à refinancer",
    question: "Type de versement",
    type: "select",
    required: true,
    options: ["Hebdomadaire", "Aux 2 semaines", "Mensuel", "Bi-mensuel"],
    condition: { field: "type_demande", includes: "Refinancement" }
  },
  {
    id: "valeur_marche",
    section: "Propriété à refinancer",
    question: "Valeur estimée de votre propriété (valeur marché actuel)",
    type: "number",
    required: true,
    placeholder: "$ Montant",
    condition: { field: "type_demande", includes: "Refinancement" }
  },
  {
    id: "annee_construction",
    section: "Propriété à refinancer",
    question: "Année de construction de la propriété",
    type: "number",
    required: true,
    placeholder: "Ex: 1995",
    condition: { field: "type_demande", includes: "Refinancement" }
  },
  {
    id: "amortissement_desire",
    section: "Propriété à refinancer",
    question: "Amortissement désiré (entre 3 et 30 ans)",
    type: "number",
    required: true,
    placeholder: "Nombre d'années",
    condition: { field: "type_demande", includes: "Refinancement" }
  },
  {
    id: "type_mise_fonds",
    section: "Nouvel achat",
    question: "Souhaitez-vous mettre un montant fixe en mise de fonds ou le % minimum ?",
    type: "select",
    required: true,
    options: ["Je ne veux pas mettre plus que la mise de fonds minimale requise", "J'ai un montant fixe que je veux utiliser pour ma mise de fonds"],
    condition: { field: "type_demande", includes: "Nouvel achat" }
  },
  {
    id: "montant_compte_banque",
    section: "Nouvel achat",
    question: "Combien d'argent avez-vous dans votre compte pour la mise de fonds ?",
    type: "number",
    required: true,
    placeholder: "$ Montant (excluant le 1.5% de la valeur)",
    condition: { field: "type_demande", includes: "Nouvel achat" }
  },
  {
    id: "montant_depuis_3mois",
    section: "Nouvel achat",
    question: "Détenez-vous ce montant depuis plus de 3 mois ?",
    type: "select",
    required: true,
    options: ["Oui", "Non"],
    condition: { field: "type_demande", includes: "Nouvel achat" }
  }
];

export default function QuestionnaireEditor() {
  const [questions, setQuestions] = useState(allQuestions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    section: '', question: '', type: 'text', required: true, options: [], condition: null
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [lastAddedQuestionId, setLastAddedQuestionId] = useState(null);

  // Référence pour le scroll
  const questionRefs = useRef({});

  // Fonction pour scroller vers une question
  const scrollToQuestion = (questionId) => {
    setTimeout(() => {
      const element = questionRefs.current[questionId];
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // Animation de surbrillance
        element.style.transition = 'all 0.3s';
        element.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.3)';
        element.style.borderColor = '#6366f1';

        setTimeout(() => {
          element.style.boxShadow = '';
          element.style.borderColor = '#e2e8f0';
        }, 1500);
      }
    }, 100);
  };

  // Fonction pour vérifier les dépendances circulaires
  const checkCircularDependency = (questionsList, questionId, targetField) => {
    let currentField = targetField;
    const visited = new Set();

    while (currentField) {
      if (visited.has(currentField)) return true;
      if (currentField === questionId) return true;

      visited.add(currentField);

      const currentQuestion = questionsList.find(q => q.id === currentField);
      if (!currentQuestion || !currentQuestion.condition) break;

      currentField = currentQuestion.condition.field;
    }

    return false;
  };

  // Fonction de réorganisation intelligente
  const reorderQuestions = (questionsList) => {
    const bySection = {};

    // 1. Group by section
    questionsList.forEach(q => {
      if (!bySection[q.section]) bySection[q.section] = [];
      bySection[q.section].push(q);
    });

    const final = [];

    Object.keys(bySection).forEach(section => {
      const sectionQuestions = bySection[section];

      // Questions sans conditions (racines)
      const rootQuestions = sectionQuestions.filter(q => !q.condition);

      // Questions avec conditions
      const conditionalQuestions = sectionQuestions.filter(q => q.condition);

      // Commencer avec les racines
      let ordered = [...rootQuestions];

      // Fonction pour insérer récursivement les questions conditionnelles
      const insertConditionalQuestions = (questionsToInsert, depth = 0) => {
        if (depth > 20) return; // Sécurité contre les boucles infinies
        if (questionsToInsert.length === 0) return;

        let insertedAny = false;
        const remaining = [];

        for (const q of questionsToInsert) {
          // Trouver l'index de la question parent
          const parentIndex = ordered.findIndex(
            item => item.id === q.condition.field
          );

          if (parentIndex !== -1) {
            // Vérifier si le parent n'est pas déjà une question conditionnelle non placée
            if (!ordered.includes(q) && parentIndex < ordered.length) {
              // Insérer immédiatement après la question parent
              ordered.splice(parentIndex + 1, 0, q);
              insertedAny = true;
            } else {
              remaining.push(q);
            }
          } else {
            remaining.push(q);
          }
        }

        // Si on a inséré quelque chose, réessayer avec les questions restantes
        if (insertedAny && remaining.length > 0) {
          insertConditionalQuestions(remaining, depth + 1);
        } else if (remaining.length > 0) {
          // Ajouter les questions restantes à la fin
          ordered.push(...remaining);
        }
      };

      // Première passe d'insertion
      insertConditionalQuestions(conditionalQuestions);

      // Vérifier que toutes les questions conditionnelles sont placées
      const allConditionalPlaced = conditionalQuestions.every(q => ordered.includes(q));
      if (!allConditionalPlaced) {
        // Fallback : ajouter les manquantes à la fin
        const missing = conditionalQuestions.filter(q => !ordered.includes(q));
        ordered.push(...missing);
      }

      final.push(...ordered);
    });

    return final;
  };

  const updateQuestion = (index, updates) => {
    const copy = [...questions];
    const originalQuestion = copy[index];

    // Vérifier les dépendances circulaires si on met à jour une condition
    if (updates.condition && updates.condition.field) {
      if (checkCircularDependency(copy, originalQuestion.id, updates.condition.field)) {
        alert('⚠️ Attention : Cette condition créerait une dépendance circulaire !');
        return;
      }
    }

    const updatedQuestion = { ...originalQuestion, ...updates };
    copy[index] = updatedQuestion;

    // Réorganiser avec la nouvelle logique
    const reordered = reorderQuestions(copy);

    // Trouver les ancien et nouveau index
    const oldIndex = index;
    const newIndex = reordered.findIndex(q => q.id === updatedQuestion.id);

    setQuestions(reordered);

    // Scroller si la position a changé OU si c'est une nouvelle condition
    if ((Math.abs(newIndex - oldIndex) > 0) || updates.condition) {
      setTimeout(() => {
        scrollToQuestion(updatedQuestion.id);
      }, 100);
    }
  };

  const addOption = (qIndex) => {
    const copy = [...questions];
    copy[qIndex].options = [...(copy[qIndex].options || []), "Nouvelle option"];
    setQuestions(reorderQuestions(copy));
  };

  const removeQuestion = (index) => {
    if (confirm("Supprimer cette question ?")) {
      setQuestions(
        reorderQuestions(questions.filter((_, i) => i !== index))
      );
    }
  };

  const handleAddNewQuestion = () => {
    let newQuestions;
    let questionId;

    if (editingIndex !== null) {
      const copy = [...questions];
      copy[editingIndex] = newQuestion;
      newQuestions = reorderQuestions(copy);
      questionId = newQuestion.id;
    } else {
      const id =
        newQuestion.question
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^\w_]/g, '')
          .substring(0, 20) +
        '_' +
        Date.now();

      questionId = id;
      const questionToAdd = { ...newQuestion, id };
      newQuestions = reorderQuestions([...questions, questionToAdd]);
    }

    setQuestions(newQuestions);
    setIsModalOpen(false);
    setEditingIndex(null);

    // Réinitialiser le formulaire
    setNewQuestion({
      section: '',
      question: '',
      type: 'text',
      required: true,
      options: [],
      condition: null
    });

    // Déclencher le scroll vers la nouvelle question
    if (questionId) {
      setLastAddedQuestionId(questionId);
    }
  };

  // Effet pour scroller vers la dernière question ajoutée
  useEffect(() => {
    if (lastAddedQuestionId) {
      scrollToQuestion(lastAddedQuestionId);
      // Réinitialiser après le scroll
      setTimeout(() => setLastAddedQuestionId(null), 2000);
    }
  }, [questions, lastAddedQuestionId]);

  // SIMPLE COPY JSON FUNCTION - GENERATES EXACT CODE FOR THE FORM PAGE
  const copyJSON = () => {
    const questionStrings = questions.map(q => {
      // Start building the object
      let obj = `  {
    id: "${q.id}",
    section: "${q.section}",
    question: "${q.question.replace(/"/g, '\\"')}",
    type: "${q.type}",
    required: ${q.required}`;

      // Add placeholder if exists
      if (q.placeholder) {
        obj += `,
    placeholder: "${q.placeholder}"`;
      }

      // Add options if exists (for select questions)
      if (q.options && q.options.length > 0) {
        obj += `,
    options: ${JSON.stringify(q.options)}`;
      }

      // Add condition if exists - USING THE NEW JSON FORMAT
      if (q.condition) {
        const { field, value, not, includes } = q.condition;

        if (value !== undefined) {
          obj += `,
    condition: { field: "${field}", value: "${value}" }`;
        } else if (not !== undefined) {
          obj += `,
    condition: { field: "${field}", not: "${not}" }`;
        } else if (includes !== undefined) {
          obj += `,
    condition: { field: "${field}", includes: "${includes}" }`;
        }
      }

      // Close the object
      obj += '\n  }';
      return obj;
    });

    // Generate the complete code - EXACTLY what goes in the form page
    const finalCode = `const allQuestions = [
${questionStrings.join(',\n')}
];`;

    // Copy to clipboard
    navigator.clipboard.writeText(finalCode);
    alert('✅ JSON copié ! Collez-le directement dans votre fichier de formulaire.');
  };

  const sections = [...new Set(questions.map(q => q.section))];

  // Get available questions for conditions (all except current)
  // Get available questions for conditions (même section que la question actuelle)
  const getAvailableQuestionsForCondition = (currentQuestionId, currentSection) => {
    return questions.filter(q =>
      q.id !== currentQuestionId &&
      q.section === currentSection
    );
  };

  // Fonction pour éditer une question existante
  const editQuestion = (index) => {
    const question = questions[index];
    setNewQuestion(question);
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  // Récupérer la question référencée par une condition
  const getReferencedQuestion = (condition) => {
    if (!condition || !condition.field) return null;
    return questions.find(q => q.id === condition.field);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-10 sticky top-0 z-10 flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">🧠 Éditeur de Questionnaire</h1>
            <p className="text-slate-500 text-sm mt-1">{questions.length} questions configurées</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditingIndex(null);
                setNewQuestion({
                  section: '',
                  question: '',
                  type: 'text',
                  required: true,
                  options: [],
                  condition: null
                });
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2"
            >
              <span>+</span>
              <span>Ajouter</span>
            </button>
            <button
              onClick={copyJSON}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2"
            >
              <span>📋</span>
              <span>Copier JSON</span>
            </button>
          </div>
        </div>

        {/* IMPORTANT NOTICE */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-blue-800 text-sm">
            💡 <strong>Comment utiliser:</strong>
            1. Modifiez les questions → 2. Cliquez "Copier JSON" → 3. Envoyez le contenu copie a JEROME
          </p>
          <p className="text-slate-500">Modifiez, puis copiez le JSON pour votre formulaire</p>
        </div>

        {/* GUIDE D'UTILISATION */}
        <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            📘 Guide d'utilisation de l'éditeur
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TYPES DE QUESTIONS */}
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800 text-sm">📋 Types de questions disponibles :</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li className="flex items-start gap-1">
                  <span className="bg-blue-100 px-1 rounded font-mono">text</span>
                  <span>→ Texte libre (prénom, nom, etc.)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="bg-blue-100 px-1 rounded font-mono">select</span>
                  <span>→ Choix multiples (liste d'options)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="bg-blue-100 px-1 rounded font-mono">number</span>
                  <span>→ Nombre (montants, âge, etc.)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="bg-blue-100 px-1 rounded font-mono">date</span>
                  <span>→ Date (calendrier)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="bg-blue-100 px-1 rounded font-mono">tel</span>
                  <span>→ Téléphone (avec drapeau pays)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="bg-blue-100 px-1 rounded font-mono">email</span>
                  <span>→ Email (validation automatique)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="bg-blue-100 px-1 rounded font-mono">textarea</span>
                  <span>→ Zone de texte long</span>
                </li>
              </ul>
            </div>

            {/* TYPES DE CONDITIONS */}
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800 text-sm">🔗 Types de conditions :</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li className="flex items-start gap-1">
                  <span className="bg-indigo-100 px-1 rounded font-mono">est égal à</span>
                  <span>→ Affiche si réponse = valeur exacte</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="bg-indigo-100 px-1 rounded font-mono">est différent de</span>
                  <span>→ Affiche si réponse ≠ valeur</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="bg-indigo-100 px-1 rounded font-mono">contient</span>
                  <span>→ Affiche si réponse contient le texte</span>
                </li>
              </ul>
            </div>
          </div>

          {/* PROCÉDURE */}
          <div className="mt-4 pt-3 border-t border-blue-200">
            <h4 className="font-semibold text-blue-800 text-sm mb-2">🚀 Comment utiliser :</h4>
            <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
              <li><strong>Modifiez</strong> vos questions (texte, options, conditions)</li>
              <li><strong>Ajoutez</strong> de nouvelles questions si besoin</li>
              <li>Cliquez sur <span className="bg-green-100 px-2 py-0.5 rounded font-mono text-green-800">📋 Copier JSON</span></li>
              <li>Envoyez le contenu copié a JEROME</li>
            </ol>

            <div className="mt-3 text-xs text-blue-600 bg-blue-100/50 p-2 rounded">
              💡 <strong>Nouveau :</strong> Les questions conditionnelles sont automatiquement placées après leur question parent et le scroll se fait automatiquement vers les questions ajoutées ou modifiées.
            </div>
          </div>
        </div>

        {/* LISTE DES SECTIONS */}
        {sections.map(section => (
          <div key={section} className="mb-12">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-lg font-bold text-slate-400 uppercase tracking-wider">{section}</h2>
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {questions.filter(q => q.section === section).length} questions
              </span>
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => {
                if (q.section !== section) return null;

                // Trouver la question parent si condition existe
                const parentQuestion = q.condition ? questions.find(pq => pq.id === q.condition.field) : null;

                return (
                  <div
                    key={q.id}
                    ref={el => questionRefs.current[q.id] = el}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    {/* En-tête avec ID et actions */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">ID: {q.id}</span>
                        {q.condition && (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                            Conditionnel
                            {parentQuestion && (
                              <span className="text-indigo-600 ml-1 truncate max-w-[150px]">
                                → {parentQuestion.question.substring(0, 20)}...
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editQuestion(i)}
                          className="text-slate-400 hover:text-indigo-500 p-1"
                          title="Modifier"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => removeQuestion(i)}
                          className="text-slate-400 hover:text-red-500 p-1"
                          title="Supprimer"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Main Content */}
                      <div className="md:col-span-7 space-y-4">
                        <textarea
                          className="w-full text-lg font-medium border-none focus:ring-0 p-0 resize-none bg-transparent"
                          rows={1}
                          value={q.question}
                          onInput={e => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                          onChange={e => updateQuestion(i, { question: e.target.value })}
                        />

                        <div className="flex gap-4 items-center">
                          <select
                            className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2"
                            value={q.type}
                            onChange={e => updateQuestion(i, { type: e.target.value })}
                          >
                            <option value="text">Texte</option>
                            <option value="number">Nombre</option>
                            <option value="select">Choix multiple</option>
                            <option value="date">Date</option>
                            <option value="tel">Téléphone</option>
                            <option value="email">Email</option>
                            <option value="textarea">Zone de texte</option>
                          </select>

                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={q.required}
                              onChange={e => updateQuestion(i, { required: e.target.checked })}
                            />
                            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            <span className="ms-3 text-sm text-slate-600">Obligatoire</span>
                          </label>
                        </div>

                        {/* Placeholder */}
                        {(q.type === 'text' || q.type === 'number' || q.type === 'email' || q.type === 'textarea') && (
                          <input
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                            placeholder="Placeholder (optionnel)"
                            value={q.placeholder || ''}
                            onChange={e => updateQuestion(i, { placeholder: e.target.value })}
                          />
                        )}

                        {/* Options for Select */}
                        {q.type === 'select' && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold text-slate-500 uppercase">Options</p>
                              <span className="text-xs text-slate-500">{q.options?.length || 0} options</span>
                            </div>
                            {q.options?.map((opt, oIdx) => (
                              <div key={oIdx} className="flex gap-2 mb-2">
                                <input
                                  className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                                  value={opt}
                                  onChange={e => {
                                    const newOpts = [...q.options];
                                    newOpts[oIdx] = e.target.value;
                                    updateQuestion(i, { options: newOpts });
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const newOpts = q.options.filter((_, idx) => idx !== oIdx);
                                    updateQuestion(i, { options: newOpts });
                                  }}
                                  className="px-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addOption(i)}
                              className="text-indigo-600 text-sm font-semibold hover:text-indigo-700 transition-colors"
                            >
                              + Ajouter une option
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Conditional Logic */}
                      <div className="md:col-span-5 border-l border-slate-100 pl-6">
                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-indigo-900 uppercase">
                              Condition d'affichage
                            </h4>
                            {q.condition && (
                              <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                                Position auto-gérée
                              </span>
                            )}
                          </div>

                          <select
                            className="w-full text-xs bg-white border border-indigo-200 rounded-md p-2 mb-2"
                            value={q.condition?.field || ""}
                            onChange={(e) => {
                              const field = e.target.value;
                              if (field === "") {
                                updateQuestion(i, { condition: null });
                              } else {
                                updateQuestion(i, {
                                  condition: {
                                    field: field,
                                    value: ""
                                  }
                                });
                              }
                            }}
                          >
                            <option value="">Toujours afficher</option>
                            {getAvailableQuestionsForCondition(q.id, q.section).map(item => (
                              <option key={item.id} value={item.id}>
                                Si: {item.question.substring(0, 30)}...
                              </option>
                            ))}
                          </select>

                          {q.condition && (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <select
                                  className="text-xs bg-white border border-indigo-200 rounded-md p-2"
                                  value={q.condition.includes ? 'includes' : q.condition.not ? 'not' : 'value'}
                                  onChange={e => {
                                    const op = e.target.value;
                                    const newCondition = { ...q.condition };

                                    // Reset other operators
                                    delete newCondition.value;
                                    delete newCondition.not;
                                    delete newCondition.includes;

                                    if (op === 'value') {
                                      newCondition.value = "";
                                    } else if (op === 'not') {
                                      newCondition.not = "";
                                    } else if (op === 'includes') {
                                      newCondition.includes = "";
                                    }

                                    updateQuestion(i, { condition: newCondition });
                                  }}
                                >
                                  <option value="value">est égal à</option>
                                  <option value="not">est différent de</option>
                                  <option value="includes">contient</option>
                                </select>

                                {(q.condition.value !== undefined || q.condition.not !== undefined) && (
                                  <>
                                    {(() => {
                                      const referencedQuestion = questions.find(item => item.id === q.condition.field);

                                      if (referencedQuestion && referencedQuestion.type === 'select' && referencedQuestion.options) {
                                        return (
                                          <select
                                            className="w-full text-xs bg-white border border-indigo-200 rounded-md p-2"
                                            value={q.condition.value || q.condition.not || ""}
                                            onChange={e => {
                                              const val = e.target.value;
                                              const newCondition = { ...q.condition };

                                              if (q.condition.value !== undefined) {
                                                newCondition.value = val;
                                              } else if (q.condition.not !== undefined) {
                                                newCondition.not = val;
                                              }

                                              updateQuestion(i, { condition: newCondition });
                                            }}
                                          >
                                            <option value="">Sélectionnez une option</option>
                                            {referencedQuestion.options.map((option, idx) => (
                                              <option key={idx} value={option}>
                                                {option}
                                              </option>
                                            ))}
                                          </select>
                                        );
                                      } else {
                                        return (
                                          <input
                                            className="w-full text-xs bg-white border border-indigo-200 rounded-md p-2"
                                            placeholder={
                                              referencedQuestion?.type === 'date' ? 'YYYY-MM-DD' :
                                                referencedQuestion?.type === 'number' ? '1234' :
                                                  'Valeur...'
                                            }
                                            value={
                                              q.condition.value ||
                                              q.condition.not ||
                                              ""
                                            }
                                            onChange={e => {
                                              const val = e.target.value;
                                              const newCondition = { ...q.condition };

                                              if (q.condition.value !== undefined) {
                                                newCondition.value = val;
                                              } else if (q.condition.not !== undefined) {
                                                newCondition.not = val;
                                              }

                                              updateQuestion(i, { condition: newCondition });
                                            }}
                                          />
                                        );
                                      }
                                    })()}
                                  </>
                                )}

                                {q.condition.includes !== undefined && (
                                  <input
                                    className="w-full text-xs bg-white border border-indigo-200 rounded-md p-2"
                                    placeholder="Texte à rechercher..."
                                    value={q.condition.includes || ""}
                                    onChange={e => {
                                      const newCondition = { ...q.condition, includes: e.target.value };
                                      updateQuestion(i, { condition: newCondition });
                                    }}
                                  />
                                )}
                              </div>

                              {parentQuestion && (
                                <div className="mt-2 p-2 bg-indigo-100/50 rounded text-xs text-indigo-700">
                                  📍 Cette question apparaîtra après : <strong>"{parentQuestion.question.substring(0, 40)}..."</strong>
                                </div>
                              )}
                            </div>
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

      {/* MODAL AJOUT/ÉDITION QUESTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full  rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">
              {editingIndex !== null ? 'Modifier la question' : 'Nouvelle question'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                <input
                  list="sections-list"
                  className="w-full border border-slate-300 rounded-xl p-3"
                  value={newQuestion.section}
                  onChange={e => setNewQuestion({ ...newQuestion, section: e.target.value })}
                  placeholder="Ex: Informations personnelles"
                />
                <datalist id="sections-list">
                  {sections.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">La question</label>
                <input
                  className="w-full border border-slate-300 rounded-xl p-3"
                  value={newQuestion.question}
                  onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  placeholder="Ex: Quel est votre nom ?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  className="w-full border border-slate-300 rounded-xl p-3"
                  value={newQuestion.type}
                  onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value })}
                >
                  <option value="text">Texte</option>
                  <option value="select">Choix multiples</option>
                  <option value="number">Nombre</option>
                  <option value="date">Date</option>
                  <option value="email">Email</option>
                  <option value="tel">Téléphone</option>
                  <option value="textarea">Zone de texte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <span>Obligatoire</span>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded"
                    checked={newQuestion.required}
                    onChange={e => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                  />
                </label>
              </div>

              {/* Condition dans la modale - COMPLÈTE */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">Condition d'affichage (optionnel)</label>

                <div className="space-y-3">
                  {/* Sélection de la question parent */}
   <select
  className="w-full border border-slate-300 rounded-xl p-3"
  value={newQuestion.condition?.field || ""}
  onChange={(e) => {
    const field = e.target.value;
    if (field === "") {
      setNewQuestion({ ...newQuestion, condition: null });
    } else {
      setNewQuestion({
        ...newQuestion,
        condition: {
          field: field,
          value: ""
        }
      });
    }
  }}
>
  <option value="">Pas de condition (toujours afficher)</option>
  {questions
    .filter(q => 
      (editingIndex === null || q.id !== newQuestion.id) &&
      q.section === newQuestion.section
    )
    .map(item => (
      <option key={item.id} value={item.id}>
        Si: {item.question.substring(0, 40)}...
      </option>
    ))
  }
</select>

                  {newQuestion.condition && newQuestion.condition.field && (
                    <>
                      {/* Type de condition */}
                      <div className="flex gap-2">
                        <select
                          className="flex-1 border border-slate-300 rounded-xl p-3"
                          value={newQuestion.condition.includes ? 'includes' : newQuestion.condition.not ? 'not' : 'value'}
                          onChange={e => {
                            const op = e.target.value;
                            const newCondition = { ...newQuestion.condition };

                            // Reset other operators
                            delete newCondition.value;
                            delete newCondition.not;
                            delete newCondition.includes;

                            if (op === 'value') {
                              newCondition.value = "";
                            } else if (op === 'not') {
                              newCondition.not = "";
                            } else if (op === 'includes') {
                              newCondition.includes = "";
                            }

                            setNewQuestion({
                              ...newQuestion,
                              condition: newCondition
                            });
                          }}
                        >
                          <option value="value">est égal à</option>
                          <option value="not">est différent de</option>
                          <option value="includes">contient</option>
                        </select>

                        {/* Valeur de la condition */}
                        {(newQuestion.condition.value !== undefined || newQuestion.condition.not !== undefined || newQuestion.condition.includes !== undefined) && (
                          <>
                            {(() => {
                              const referencedQuestion = questions.find(item => item.id === newQuestion.condition.field);

                              if (referencedQuestion && referencedQuestion.type === 'select' && referencedQuestion.options) {
                                // Pour les questions select, afficher un dropdown
                                return (
                                  <select
                                    className="flex-1 border border-slate-300 rounded-xl p-3"
                                    value={
                                      newQuestion.condition.value ||
                                      newQuestion.condition.not ||
                                      newQuestion.condition.includes ||
                                      ""
                                    }
                                    onChange={e => {
                                      const val = e.target.value;
                                      const updatedCondition = { ...newQuestion.condition };

                                      if (newQuestion.condition.value !== undefined) {
                                        updatedCondition.value = val;
                                      } else if (newQuestion.condition.not !== undefined) {
                                        updatedCondition.not = val;
                                      } else if (newQuestion.condition.includes !== undefined) {
                                        updatedCondition.includes = val;
                                      }

                                      setNewQuestion({
                                        ...newQuestion,
                                        condition: updatedCondition
                                      });
                                    }}
                                  >
                                    <option value="">Sélectionnez une option</option>
                                    {referencedQuestion.options.map((option, idx) => (
                                      <option key={idx} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                );
                              } else {
                                // Pour les autres types, afficher un input
                                return (
                                  <input
                                    className="flex-1 border border-slate-300 rounded-xl p-3"
                                    placeholder={
                                      referencedQuestion?.type === 'date' ? 'YYYY-MM-DD' :
                                        referencedQuestion?.type === 'number' ? '1234' :
                                          newQuestion.condition.includes ? 'Texte à rechercher...' :
                                            'Valeur...'
                                    }
                                    value={
                                      newQuestion.condition.value ||
                                      newQuestion.condition.not ||
                                      newQuestion.condition.includes ||
                                      ""
                                    }
                                    onChange={e => {
                                      const val = e.target.value;
                                      const updatedCondition = { ...newQuestion.condition };

                                      if (newQuestion.condition.value !== undefined) {
                                        updatedCondition.value = val;
                                      } else if (newQuestion.condition.not !== undefined) {
                                        updatedCondition.not = val;
                                      } else if (newQuestion.condition.includes !== undefined) {
                                        updatedCondition.includes = val;
                                      }

                                      setNewQuestion({
                                        ...newQuestion,
                                        condition: updatedCondition
                                      });
                                    }}
                                  />
                                );
                              }
                            })()}
                          </>
                        )}
                      </div>

                      {/* Info sur la question référencée */}
                      {(() => {
                        const referencedQuestion = questions.find(q => q.id === newQuestion.condition.field);
                        if (!referencedQuestion) return null;

                        return (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">
                              📍 Cette question sera automatiquement placée après :
                              <strong> "{referencedQuestion.question.substring(0, 50)}..."</strong>
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Type: <span className="font-mono">{referencedQuestion.type}</span> |
                              Options: {referencedQuestion.options?.length || 0}
                            </p>
                            {newQuestion.condition.value !== undefined && (
                              <p className="text-xs text-blue-600 mt-1">
                                Condition: <span className="font-semibold">est égal à "{newQuestion.condition.value}"</span>
                              </p>
                            )}
                            {newQuestion.condition.not !== undefined && (
                              <p className="text-xs text-blue-600 mt-1">
                                Condition: <span className="font-semibold">est différent de "{newQuestion.condition.not}"</span>
                              </p>
                            )}
                            {newQuestion.condition.includes !== undefined && (
                              <p className="text-xs text-blue-600 mt-1">
                                Condition: <span className="font-semibold">contient "{newQuestion.condition.includes}"</span>
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleAddNewQuestion}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-colors"
              >
                {editingIndex !== null ? 'Mettre à jour' : 'Créer'}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold transition-colors"
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

// Icônes
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);