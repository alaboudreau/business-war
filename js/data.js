const BUSINESS_TYPES = {
    RESOURCE: "Exploitation de ressource",
    MANUFACTURING: "Manufacturier",
    WHOLESALE: "Grossiste",
    RETAIL: "Détaillant"
};

const BUSINESS_NAMES = {
    RESOURCE: ["Mine de Charbon", "Puits de pétrole", "Forêt d'exploitation", "Mine d'or"],
    MANUFACTURING: ["Usine de meubles", "Fabrique de jouets", "Usine de textile", "Constructeur automobile"],
    WHOLESALE: ["Entrepôt alimentaire", "Grossiste en électronique", "Distributeur de pièces", "Import-Export"],
    RETAIL: ["Chaîne de supermarchés", "Boutique de luxe", "Magasin d'électronique", "Restaurant fast-food"]
};

const gameEvents = [
    {
        id: 'BUY_EVENT_FAKE_FINANCIALS',
        trigger: 'buy',
        description: "Mauvaise nouvelle! Les résultats financiers de {businessName} étaient truqués. Ses revenus réels sont 50% plus bas.",
        probability: 0.1,
        effect: (gameState, business) => {
            business.revenue *= 0.5;
        }
    },
    {
        id: 'BUY_EVENT_OPTIMIZATION',
        trigger: 'buy',
        description: "Bonne nouvelle! Vous avez trouvé une optimisation majeure chez {businessName}. Ses revenus augmentent de 25%.",
        probability: 0.1,
        effect: (gameState, business) => {
            business.revenue *= 1.25;
        }
    },
    {
        id: 'BUY_EVENT_MONEY_LAUNDERING',
        trigger: 'buy',
        description: "Une offre douteuse vous est proposée pour {businessName}: blanchir de l'argent pour un groupe criminel. Acceptez-vous d'augmenter les revenus de 25% au prix d'un coup à votre réputation?",
        probability: 0.15,
        isChoice: true,
        effect: (gameState, business) => {
            // This will be handled by a choice modal
            showChoiceModal(gameEvents.find(e => e.id === 'BUY_EVENT_MONEY_LAUNDERING'), business);
        },
        resolve: (gameState, business, choice) => {
            if (choice) {
                business.revenue *= 1.25;
                gameState.reputation -= 5;
                gameState.log.unshift("Vous avez accepté l'offre de blanchiment d'argent.");
            } else {
                gameState.log.unshift("Vous avez refusé l'offre douteuse.");
            }
        }
    },
    {
        id: 'SELL_EVENT_BOYCOTT',
        trigger: 'sell',
        description: "Un boycott des employés éclate lors de la vente de {businessName}, le prix de vente chute de 25%!",
        probability: 0.1,
        effect: (gameState, business) => {
            // This effect needs to be handled inside sellBusiness, as it modifies the sale price
        }
    },
    {
        id: 'TRAVEL_EVENT_LOSE_TURN',
        trigger: 'travel',
        description: "Votre vol a été retardé, vous perdez un jour supplémentaire.",
        probability: 0.05,
        effect: (gameState) => {
            gameState.turns--;
        }
    },
    {
        id: 'TURN_EVENT_GOV_CONTRACT',
        trigger: 'turn_start',
        description: "Une opportunité de contrat gouvernemental truqué se présente. Revenus +500% pour un tour, mais -5 de réputation. Acceptez-vous?",
        probability: 0.05,
        isChoice: true,
        effect: (gameState) => {
            showChoiceModal(gameEvents.find(e => e.id === 'TURN_EVENT_GOV_CONTRACT'));
        },
        resolve: (gameState, target, choice) => {
            if (choice) {
                const ownedBusinesses = gameState.allBusinesses.filter(b => b.owner === 'player');
                if (ownedBusinesses.length > 0) {
                    const randomBusiness = ownedBusinesses[Math.floor(Math.random() * ownedBusinesses.length)];
                    const bonus = randomBusiness.revenue * 5;
                    gameState.money += bonus;
                    gameState.reputation -= 5;
                    gameState.log.unshift(`Le contrat truqué pour ${randomBusiness.name} vous a rapporté un bonus de ${bonus.toLocaleString()}$`);
                }
            } else {
                gameState.log.unshift("Vous avez refusé le contrat gouvernemental douteux.");
            }
        }
    }
];

const countries = [
    { name: "USA", bank: true },
    { name: "Chine" },
    { name: "Allemagne" },
    { name: "Japon" },
    { name: "France" },
    { name: "Canada" },
    { name: "Royaume-Uni" }
];
