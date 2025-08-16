const i18nData = {
    fr: {
        BUSINESS_TYPES: {
            RESOURCE: "Exploitation de ressource",
            MANUFACTURING: "Manufacturier",
            WHOLESALE: "Grossiste",
            RETAIL: "Détaillant"
        },
        BUSINESS_NAMES: {
            RESOURCE: ["Mine de Charbon", "Puits de pétrole", "Forêt d'exploitation", "Mine d'or"],
            MANUFACTURING: ["Usine de meubles", "Fabrique de jouets", "Usine de textile", "Constructeur automobile"],
            WHOLESALE: ["Entrepôt alimentaire", "Grossiste en électronique", "Distributeur de pièces", "Import-Export"],
            RETAIL: ["Chaîne de supermarchés", "Boutique de luxe", "Magasin d'électronique", "Restaurant fast-food"]
        },
        COUNTRIES: [
            { name: "USA", bank: true }, { name: "Chine" }, { name: "Allemagne" },
            { name: "Japon" }, { name: "France" }, { name: "Canada" }, { name: "Royaume-Uni" }
        ],
        UI: {
            newGame: "Nouvelle partie",
            shortGame: "Courte (10 jours)",
            normalGame: "Normale (30 jours)",
            longGame: "Toute la nuit (60 jours)",
            scoreboard: "Tableau des scores",
            credits: "Crédits",
            day: "Jour",
            stats: "Stats",
            money: "Argent",
            debt: "Dette",
            reputation: "Réputation",
            businesses: "Entreprises",
            actions: "Actions",
            travel: "Voyager",
            visitBank: "Visiter la banque",
            localMarket: "Marché local",
            myBusinessesInCountry: "Mes entreprises dans ce pays",
            noBusinessForSale: "Aucune entreprise à vendre.",
            noBusinessOwned: "Aucune entreprise possédée ici.",
            estimatedRevenue: "Revenus estimés",
            price: "Prix",
            buy: "Acheter",
            revenue: "Revenus",
            costs: "Coûts",
            sell: "Vendre",
            manage: "Gérer",
            journal: "Journal",
            turnInfo: "Jour {turn}: Revenus: {income}$. Dépenses (intérêts): {expenses}$.",
            gameOverTime: "Le temps est écoulé!",
            gameOverReputation: "Votre réputation est si basse que vous avez été arrêté!",
            gameOverTitle: "Partie terminée",
            finalScore: "Score final",
            finalMoney: "Argent final",
            businessValue: "Valeur des entreprises",
            totalScore: "Score Total",
            playAgain: "Rejouer",
            travelTitle: "Où voyager ?",
            cancel: "Annuler",
            bankTitle: "Banque",
            currentDebt: "Votre dette actuelle est de",
            repayAmountPlaceholder: "Montant à rembourser",
            repay: "Rembourser",
            borrowButton: "Emprunter 150 000 $",
            leaveBank: "Quitter la banque",
            invalidAmount: "Montant invalide.",
            notEnoughMoney: "Vous n'avez pas assez d'argent.",
            repayLog: "Vous avez remboursé {amount}.",
            borrowLog: "Vous avez emprunté 150 000 $.",
            buyLog: "Vous avez acheté {businessName} pour {price}.",
            sellLog: "Vous avez vendu {businessName} pour {salePrice}.",
            eventPrefix: "ÉVÉNEMENT",
            opportunity: "Opportunité!",
            accept: "Accepter",
            decline: "Refuser",
            manageTitle: "Gérer",
            competitiveness: "Concurrentialité",
            rdLevel: "Niveau R&D",
            managementActions: "Actions de gestion",
            investRDButton: "Investir en R&D (Coût: 25k$)",
            rationalizeButton: "Rationaliser (Coût: 10k$)",
            launchProductButton: "Lancer un produit",
            strategicPlanButton: "Planification Stratégique (Coût: 50k$)",
            close: "Fermer",
            ok: "OK",
            investRDLog: "Vous avez investi en R&D pour {businessName}.",
            rationalizeLog: "Vous avez rationalisé les coûts pour {businessName}.",
            rdLevelTooLow: "Niveau de R&D trop faible pour lancer un produit!",
            launchProductLog: "Nouveau lancement de produit réussi pour {businessName}!",
            strategicPlanSuccessLog: "La planification stratégique a augmenté les revenus de {businessName}.",
            strategicPlanFailLog: "La planification stratégique n'a pas eu d'effet notable pour {businessName}.",
            netWorth: "Avoir",
            avgRD: "Moyenne R&D",
            avgComp: "Moyenne Compétitivité",
            ownedBusinesses: "Entreprises possédées",
            leaderboardTitle: "Tableau des scores",
            leaderboardRank: "Rang",
            leaderboardScore: "Score",
            leaderboardStats: "Stats"
        }
    },
    en: {
        BUSINESS_TYPES: {
            RESOURCE: "Resource Extraction",
            MANUFACTURING: "Manufacturing",
            WHOLESALE: "Wholesale",
            RETAIL: "Retail"
        },
        BUSINESS_NAMES: {
            RESOURCE: ["Coal Mine", "Oil Well", "Logging Forest", "Gold Mine"],
            MANUFACTURING: ["Furniture Factory", "Toy Factory", "Textile Mill", "Car Manufacturer"],
            WHOLESALE: ["Food Warehouse", "Electronics Wholesaler", "Parts Distributor", "Import-Export"],
            RETAIL: ["Supermarket Chain", "Luxury Boutique", "Electronics Store", "Fast-Food Restaurant"]
        },
        COUNTRIES: [
            { name: "USA", bank: true }, { name: "China" }, { name: "Germany" },
            { name: "Japan" }, { name: "France" }, { name: "Canada" }, { name: "United Kingdom" }
        ],
        UI: {
            newGame: "New Game",
            shortGame: "Short (10 days)",
            normalGame: "Normal (30 days)",
            longGame: "All-nighter (60 days)",
            scoreboard: "Scoreboard",
            credits: "Credits",
            day: "Day",
            stats: "Stats",
            money: "Money",
            debt: "Debt",
            reputation: "Reputation",
            businesses: "Businesses",
            actions: "Actions",
            travel: "Travel",
            visitBank: "Visit Bank",
            localMarket: "Local Market",
            myBusinessesInCountry: "My Businesses in this Country",
            noBusinessForSale: "No businesses for sale.",
            noBusinessOwned: "No owned businesses here.",
            estimatedRevenue: "Estimated Revenue",
            price: "Price",
            buy: "Buy",
            revenue: "Revenue",
            costs: "Costs",
            sell: "Sell",
            manage: "Manage",
            journal: "Journal",
            turnInfo: "Day {turn}: Income: ${income}. Expenses (interest): ${expenses}.",
            gameOverTime: "Time is up!",
            gameOverReputation: "Your reputation is so low that you have been arrested!",
            gameOverTitle: "Game Over",
            finalScore: "Final Score",
            finalMoney: "Final Money",
            businessValue: "Business Value",
            totalScore: "Total Score",
            playAgain: "Play Again",
            travelTitle: "Where to travel?",
            cancel: "Cancel",
            bankTitle: "Bank",
            currentDebt: "Your current debt is",
            repayAmountPlaceholder: "Amount to repay",
            repay: "Repay",
            borrowButton: "Borrow $150,000",
            leaveBank: "Leave Bank",
            invalidAmount: "Invalid amount.",
            notEnoughMoney: "You don't have enough money.",
            repayLog: "You repaid {amount}.",
            borrowLog: "You borrowed $150,000.",
            buyLog: "You bought {businessName} for {price}.",
            sellLog: "You sold {businessName} for {salePrice}.",
            eventPrefix: "EVENT",
            opportunity: "Opportunity!",
            accept: "Accept",
            decline: "Decline",
            manageTitle: "Manage",
            competitiveness: "Competitiveness",
            rdLevel: "R&D Level",
            managementActions: "Management Actions",
            investRDButton: "Invest in R&D (Cost: 25k)",
            rationalizeButton: "Rationalize (Cost: 10k)",
            launchProductButton: "Launch Product",
            strategicPlanButton: "Strategic Planning (Cost: 50k)",
            close: "Close",
            ok: "OK",
            investRDLog: "You invested in R&D for {businessName}.",
            rationalizeLog: "You rationalized costs for {businessName}.",
            rdLevelTooLow: "R&D level too low to launch a product!",
            launchProductLog: "Successful new product launch for {businessName}!",
            strategicPlanSuccessLog: "Strategic planning increased revenue for {businessName}.",
            strategicPlanFailLog: "Strategic planning had no noticeable effect for {businessName}.",
            netWorth: "Net Worth",
            avgRD: "Average R&D",
            avgComp: "Average Competitiveness",
            ownedBusinesses: "Owned Businesses",
            leaderboardTitle: "Leaderboard",
            leaderboardRank: "Rank",
            leaderboardScore: "Score",
            leaderboardStats: "Stats"
        }
    }
};

const gameEvents = [
    {
        id: 'BUY_EVENT_FAKE_FINANCIALS',
        trigger: 'buy',
        story: {
            fr: "Vous venez de finaliser l'acquisition de {businessName} quand votre comptable vous appelle, l'air paniqué.",
            en: "You've just finalized the acquisition of {businessName} when your accountant calls you, sounding panicked."
        },
        description: {
            fr: "Mauvaise nouvelle! Les résultats financiers étaient truqués. Ses revenus réels sont 50% plus bas.",
            en: "Bad news! The financial results were faked. Its real revenue is 50% lower."
        },
        probability: 0.1,
        effect: (gameState, business) => { business.revenue *= 0.5; }
    },
    {
        id: 'BUY_EVENT_OPTIMIZATION',
        trigger: 'buy',
        story: {
            fr: "En examinant les opérations de {businessName}, votre nouvelle équipe de direction a trouvé quelque chose d'incroyable.",
            en: "While reviewing the operations at {businessName}, your new management team found something incredible."
        },
        description: {
            fr: "Bonne nouvelle! Vous avez trouvé une optimisation majeure. Ses revenus augmentent de 25%.",
            en: "Good news! You've found a major optimization. Its revenue increases by 25%."
        },
        probability: 0.1,
        effect: (gameState, business) => { business.revenue *= 1.25; }
    },
    {
        id: 'BUY_EVENT_MONEY_LAUNDERING',
        trigger: 'buy',
        story: {
            fr: "Un homme en costume coûteux vous approche dans un café. Il dit représenter des 'investisseurs silencieux' qui sont très intéressés par votre nouvelle acquisition, {businessName}.",
            en: "A man in an expensive suit approaches you at a coffee shop. He says he represents 'silent investors' who are very interested in your new acquisition, {businessName}."
        },
        description: {
            fr: "Il vous propose de faire passer des fonds via l'entreprise pour augmenter artificiellement ses revenus de 25%. C'est illégal et nuira à votre réputation.",
            en: "He proposes to run funds through the company to artificially boost its revenue by 25%. It's illegal and will hurt your reputation."
        },
        probability: 0.15,
        isChoice: true,
        acceptText: { fr: "Accepter l'argent sale", en: "Accept the dirty money" },
        declineText: { fr: "Refuser poliment", en: "Politely refuse" },
        effect: (gameState, business) => { showChoiceModal(gameEvents.find(e => e.id === 'BUY_EVENT_MONEY_LAUNDERING'), business); },
        resolve: (gameState, business, choice) => {
            if (choice) {
                business.revenue *= 1.25;
                gameState.reputation -= 5;
                return {fr: "Vous avez accepté l'offre de blanchiment d'argent.", en: "You accepted the money laundering offer."};
            } else {
                return {fr: "Vous avez refusé l'offre douteuse.", en: "You refused the shady offer."};
            }
        }
    },
    {
        id: 'SELL_EVENT_BOYCOTT',
        trigger: 'sell',
        story: {
            fr: "Alors que vous finalisez la vente de {businessName}, des nouvelles de dernière minute éclatent.",
            en: "As you are finalizing the sale of {businessName}, breaking news erupts."
        },
        description: {
            fr: "Les employés, mécontents de la vente, organisent un boycott! L'acheteur menace de se retirer à moins que vous ne baissiez le prix.",
            en: "The employees, unhappy with the sale, are staging a boycott! The buyer is threatening to pull out unless you lower the price."
        },
        probability: 0.15,
        isChoice: true,
        acceptText: { fr: "Céder et baisser le prix", en: "Give in and lower the price" },
        declineText: { fr: "Tenir bon (risque d'échec)", en: "Hold firm (risk failure)" },
        effect: (gameState, business) => { showChoiceModal(gameEvents.find(e => e.id === 'SELL_EVENT_BOYCOTT'), business); },
        resolve: (gameState, business, choice) => {
            if (choice) {
                // This is a flag the sellBusiness function will check
                business.salePriceModifier = 0.75;
                return {fr: "Vous cédez à la pression. Le prix de vente est réduit.", en: "You give in to the pressure. The sale price is reduced."};
            } else {
                if (Math.random() < 0.5) { // 50% chance the sale fails
                    business.saleFailed = true;
                    return {fr: "Votre fermeté a fait capoter la vente!", en: "Your firmness caused the sale to fail!"};
                } else {
                    return {fr: "Votre bluff a fonctionné! La vente se poursuit au prix initial.", en: "Your bluff worked! The sale proceeds at the original price."};
                }
            }
        }
    },
    {
        id: 'TRAVEL_EVENT_LOSE_TURN',
        trigger: 'travel',
        story: {
            fr: "Votre voyage est interrompu par un problème inattendu.",
            en: "Your journey is interrupted by an unexpected problem."
        },
        description: {
            fr: "Votre vol a été annulé à cause d'une grève des contrôleurs aériens! Vous perdez un jour à trouver un autre vol.",
            en: "Your flight was canceled due to an air traffic controller strike! You lose a day finding another flight."
        },
        probability: 0.05,
        effect: (gameState) => { gameState.turns--; }
    },
    {
        id: 'TURN_EVENT_GOV_CONTRACT',
        trigger: 'turn_start',
        story: {
            fr: "Un contact au gouvernement vous appelle avec une 'opportunité' spéciale.",
            en: "A government contact calls you with a special 'opportunity'."
        },
        description: {
            fr: "Il y a un contrat public lucratif. Votre contact peut vous le garantir en échange d'un petit pot-de-vin qui entachera votre réputation. Le contrat donnera un bonus de revenu équivalent à 500% des revenus d'une de vos entreprises pour ce tour.",
            en: "There's a lucrative public contract available. Your contact can guarantee it for you in exchange for a small bribe that will stain your reputation. The contract will provide a revenue bonus equal to 500% of one of your businesses' revenue for this turn."
        },
        probability: 0.05,
        isChoice: true,
        acceptText: { fr: "Accepter le contrat", en: "Accept the contract" },
        declineText: { fr: "Refuser l'offre", en: "Refuse the offer" },
        effect: (gameState) => { showChoiceModal(gameEvents.find(e => e.id === 'TURN_EVENT_GOV_CONTRACT')); },
        resolve: (gameState, target, choice) => {
            if (choice) {
                const ownedBusinesses = gameState.allBusinesses.filter(b => b.owner === 'player');
                if (ownedBusinesses.length > 0) {
                    const randomBusiness = ownedBusinesses[Math.floor(Math.random() * ownedBusinesses.length)];
                    const bonus = randomBusiness.revenue * 5;
                    gameState.money += bonus;
                    gameState.reputation -= 5;
                    return {fr: `Le contrat truqué pour ${randomBusiness.name} vous a rapporté un bonus de ${bonus.toLocaleString()}$`, en: `The rigged contract for ${randomBusiness.name} earned you a bonus of $${bonus.toLocaleString()}`};
                }
            } else {
                return {fr: "Vous avez refusé le contrat gouvernemental douteux.", en: "You refused the shady government contract."};
            }
            return null;
        }
    }
];
