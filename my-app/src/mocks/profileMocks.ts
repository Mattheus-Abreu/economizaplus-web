export const MOCK_CATEGORIES = [
  { id: "cat-1", name: "Restaurantes", color: "#F97316", icon: "cutlery" },
  { id: "cat-2", name: "Transporte",   color: "#818CF8", icon: "car" },
  { id: "cat-3", name: "Compras",      color: "#EC4899", icon: "shopping-bag" },
  { id: "cat-4", name: "Saúde",        color: "#22C55E", icon: "heartbeat" },
  { id: "cat-5", name: "Lazer",        color: "#FACC15", icon: "gamepad" },
];

// Maio 2026 — todas as despesas do mês
export const MOCK_TRANSACTIONS = [
  // Restaurantes → R$ 314,10 (5 transações)
  { id: "t1", type: "EXPENSE", categoryId: "cat-1", description: "iFood",           amount: 42.90,  paymentMethod: "CREDIT_CARD", transactionDate: "2026-05-28", walletId: "w1" },
  { id: "t2", type: "EXPENSE", categoryId: "cat-1", description: "Restaurante Roma", amount: 89.50,  paymentMethod: "PIX",         transactionDate: "2026-05-22", walletId: "w1" },
  { id: "t3", type: "EXPENSE", categoryId: "cat-1", description: "McDonald's",       amount: 37.80,  paymentMethod: "DEBIT_CARD",  transactionDate: "2026-05-18", walletId: "w1" },
  { id: "t4", type: "EXPENSE", categoryId: "cat-1", description: "Outback",          amount: 112.40, paymentMethod: "CREDIT_CARD", transactionDate: "2026-05-14", walletId: "w1" },
  { id: "t5", type: "EXPENSE", categoryId: "cat-1", description: "Habib's",          amount: 31.50,  paymentMethod: "DEBIT_CARD",  transactionDate: "2026-05-07", walletId: "w1" },
  // Transporte → R$ 138,60 (2 transações)
  { id: "t6", type: "EXPENSE", categoryId: "cat-2", description: "Uber",             amount: 18.60,  paymentMethod: "CREDIT_CARD", transactionDate: "2026-05-27", walletId: "w1" },
  { id: "t7", type: "EXPENSE", categoryId: "cat-2", description: "Combustível",      amount: 120.00, paymentMethod: "PIX",         transactionDate: "2026-05-15", walletId: "w1" },
  // Compras → R$ 224,60 (2 transações)
  { id: "t8", type: "EXPENSE", categoryId: "cat-3", description: "Mercado Livre",    amount: 159.90, paymentMethod: "CREDIT_CARD", transactionDate: "2026-05-25", walletId: "w1" },
  { id: "t9", type: "EXPENSE", categoryId: "cat-3", description: "Shopee",           amount: 64.70,  paymentMethod: "PIX",         transactionDate: "2026-05-12", walletId: "w1" },
  // Saúde → R$ 53,40 (1 transação)
  { id: "t10", type: "EXPENSE", categoryId: "cat-4", description: "Farmácia",        amount: 53.40,  paymentMethod: "DEBIT_CARD",  transactionDate: "2026-05-20", walletId: "w1" },
  // Lazer → R$ 125,80 (2 transações)
  { id: "t11", type: "EXPENSE", categoryId: "cat-5", description: "Netflix",         amount: 45.90,  paymentMethod: "CREDIT_CARD", transactionDate: "2026-05-01", walletId: "w1" },
  { id: "t12", type: "EXPENSE", categoryId: "cat-5", description: "Steam",           amount: 79.90,  paymentMethod: "CREDIT_CARD", transactionDate: "2026-05-10", walletId: "w1" },
];

// Totais derivados (usados no profile)
export const MOCK_MONTH_TOTAL = MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0); // 856.50
export const MOCK_TOP_CATEGORY = MOCK_CATEGORIES[0]; // Restaurantes — maior gasto
export const MOCK_TOP_CATEGORY_TOTAL = MOCK_TRANSACTIONS
  .filter((t) => t.categoryId === "cat-1")
  .reduce((s, t) => s + t.amount, 0); // 314.10
export const MOCK_TOP_CATEGORY_COUNT = MOCK_TRANSACTIONS.filter((t) => t.categoryId === "cat-1").length; // 5

// Histórico mensal para o gráfico de barras — inclui categoria + gasta de cada mês
export const MOCK_MONTHLY_TOTALS = [
  {
    month: 11, year: 2025, label: "Dez", total: 542.30,
    topCategoryId: "cat-3", topCategoryTotal: 220.00, topCategoryCount: 3,
    breakdown: [
      { categoryId: "cat-3", pct: 41 },
      { categoryId: "cat-1", pct: 22 },
      { categoryId: "cat-2", pct: 18 },
      { categoryId: "cat-5", pct: 12 },
      { categoryId: "cat-4", pct: 7  },
    ],
  },
  {
    month: 0,  year: 2026, label: "Jan", total: 698.80,
    topCategoryId: "cat-5", topCategoryTotal: 310.50, topCategoryCount: 4,
    breakdown: [
      { categoryId: "cat-5", pct: 44 },
      { categoryId: "cat-1", pct: 24 },
      { categoryId: "cat-3", pct: 16 },
      { categoryId: "cat-2", pct: 10 },
      { categoryId: "cat-4", pct: 6  },
    ],
  },
  {
    month: 1,  year: 2026, label: "Fev", total: 481.20,
    topCategoryId: "cat-4", topCategoryTotal: 198.40, topCategoryCount: 2,
    breakdown: [
      { categoryId: "cat-4", pct: 41 },
      { categoryId: "cat-3", pct: 22 },
      { categoryId: "cat-1", pct: 18 },
      { categoryId: "cat-5", pct: 12 },
      { categoryId: "cat-2", pct: 7  },
    ],
  },
  {
    month: 2,  year: 2026, label: "Mar", total: 723.60,
    topCategoryId: "cat-2", topCategoryTotal: 290.80, topCategoryCount: 3,
    breakdown: [
      { categoryId: "cat-2", pct: 40 },
      { categoryId: "cat-1", pct: 22 },
      { categoryId: "cat-3", pct: 18 },
      { categoryId: "cat-5", pct: 12 },
      { categoryId: "cat-4", pct: 8  },
    ],
  },
  {
    month: 3,  year: 2026, label: "Abr", total: 634.90,
    topCategoryId: "cat-3", topCategoryTotal: 258.60, topCategoryCount: 3,
    breakdown: [
      { categoryId: "cat-3", pct: 41 },
      { categoryId: "cat-1", pct: 24 },
      { categoryId: "cat-5", pct: 16 },
      { categoryId: "cat-2", pct: 12 },
      { categoryId: "cat-4", pct: 7  },
    ],
  },
  {
    month: 4,  year: 2026, label: "Mai", total: 856.50,
    topCategoryId: "cat-1", topCategoryTotal: 314.10, topCategoryCount: 5,
    breakdown: [
      { categoryId: "cat-1", pct: 37 },
      { categoryId: "cat-3", pct: 26 },
      { categoryId: "cat-2", pct: 16 },
      { categoryId: "cat-5", pct: 15 },
      { categoryId: "cat-4", pct: 6  },
    ],
  },
];
