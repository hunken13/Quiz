// Frågorna i quizet. Typer:
//   mc       – flerval, `correct` = index i `options` (0 = första)
//   tf       – sant/falskt, `correct` = true eller false
//   estimate – skattning, `correct` = rätt tal. Full poäng inom `tolerance`
//              (andel, 0.1 = ±10 %), halv poäng inom dubbla toleransen.
// `explanation` visas efter att man svarat.

window.QUIZ = {
  title: "Från konsumentkreditinstitut till bank",
  subtitle: "Hur bra koll har du på kapitaltäckning?",
  questions: [
    {
      id: "q1",
      type: "mc",
      text: "Vad handlar kapitaltäckning om i grunden?",
      options: [
        "Att alla insättningar alltid finns kvar som kontanter",
        "Att bolaget har tillräckligt med eget kapital i förhållande till riskerna i tillgångarna",
        "Att alla lån är försäkrade mot kreditförluster",
        "Att bolaget går med vinst varje kvartal",
      ],
      correct: 1,
      explanation:
        "Kapitaltäckning handlar om att det egna kapitalet ska räcka för att täcka oväntade förluster. Ju mer risk i tillgångarna, desto mer kapital krävs.",
    },
    {
      id: "q2",
      type: "tf",
      text: "Som konsumentkreditinstitut omfattas vi redan i dag av samma kapitaltäckningsregler (CRR) som en bank.",
      correct: false,
      explanation:
        "Falskt. Konsumentkreditinstitut har inga CRR-krav. Med tillstånd som bank eller kreditmarknadsbolag gäller hela kapitaltäckningsregelverket fullt ut.",
    },
    {
      id: "q3",
      type: "mc",
      text: "Vilken EU-förordning innehåller de grundläggande kapitalkraven för banker?",
      options: ["GDPR", "MiFID II", "CRR", "PSD2"],
      correct: 2,
      explanation:
        "CRR (Capital Requirements Regulation) gäller direkt i hela EU. Den kompletteras av direktivet CRD, som i Sverige genomförs bland annat i lagen om kapitalbuffertar.",
    },
    {
      id: "q4",
      type: "mc",
      text: "Hur stort är det totala minimikravet på kapital i pelare 1, räknat på det riskvägda exponeringsbeloppet?",
      options: ["3 %", "4,5 %", "8 %", "12 %"],
      correct: 2,
      explanation:
        "8 % totalt. Minst 4,5 % ska vara kärnprimärkapital (CET1) och minst 6 % primärkapital. Ovanpå det kommer buffertkrav och pelare 2-krav.",
    },
    {
      id: "q5",
      type: "mc",
      text: "Vilken riskvikt får ett vanligt blancolån till en privatperson enligt schablonmetoden?",
      options: ["0 %", "35 %", "75 %", "100 %"],
      correct: 2,
      explanation:
        "75 %. Lånet är en hushållsexponering. Lån som har fallerat får högre riskvikt: 100 eller 150 %, beroende på hur stora reserveringar som gjorts.",
    },
    {
      id: "q6",
      type: "estimate",
      text: "Vi har 1 000 Mkr i blancolån som inte har fallerat. Hur stort blir det riskvägda exponeringsbeloppet?",
      unit: "Mkr",
      correct: 750,
      tolerance: 0.1,
      explanation: "1 000 Mkr × 75 % = 750 Mkr i riskvägt exponeringsbelopp för kreditrisken.",
    },
    {
      id: "q7",
      type: "estimate",
      text: "Med 750 Mkr i riskvägt exponeringsbelopp: hur mycket kapital krävs minst för att klara pelare 1-kravet på 8 %?",
      unit: "Mkr",
      correct: 60,
      tolerance: 0.1,
      explanation:
        "750 Mkr × 8 % = 60 Mkr. Buffertar, pelare 2 och kapital för operativ risk tillkommer, så det verkliga behovet är klart högre.",
    },
    {
      id: "q8",
      type: "mc",
      text: "Vilken av följande poster räknas INTE in i kärnprimärkapitalet utan dras av från det?",
      options: [
        "Aktiekapital",
        "Balanserade vinstmedel",
        "Överkursfond",
        "Aktiverade utvecklingsutgifter (immateriella tillgångar)",
      ],
      correct: 3,
      explanation:
        "Immateriella tillgångar som goodwill och aktiverade utvecklingsutgifter dras av. De antas inte gå att sälja för att täcka förluster när det krisar.",
    },
    {
      id: "q9",
      type: "tf",
      text: "Kapitalkonserveringsbufferten är 2,5 % och ska bestå av kärnprimärkapital.",
      correct: true,
      explanation:
        "Sant. Om bufferten underskrids får bolaget begränsningar, till exempel för utdelningar och rörliga ersättningar.",
    },
    {
      id: "q10",
      type: "mc",
      text: "Vad handlar pelare 2 om?",
      options: [
        "Offentliggörande av information om risker och kapital",
        "Finansinspektionens bedömning av bolagets specifika risker och eventuella extra kapitalkrav",
        "Insättningsgarantin",
        "Minimikravet på 8 %",
      ],
      correct: 1,
      explanation:
        "Pelare 2 fångar risker som pelare 1 inte täcker, till exempel koncentrationsrisk och ränterisk. FI kan då ställa ett individuellt tilläggskrav. Pelare 3 handlar om offentliggörande.",
    },
    {
      id: "q11",
      type: "mc",
      text: "Vad kallas bolagets egen bedömning av hur mycket kapital och likviditet det behöver?",
      options: ["SREP", "IKLU", "KYC", "LCR"],
      correct: 1,
      explanation:
        "IKLU, intern kapital- och likviditetsutvärdering (på engelska ICAAP/ILAAP). SREP är FI:s granskning av bolaget, som bland annat bygger på IKLU:n.",
    },
    {
      id: "q12",
      type: "mc",
      text: "Vilket minimikrav gäller för bruttosoliditet (leverage ratio)?",
      options: ["1 %", "3 %", "8 %", "10 %"],
      correct: 1,
      explanation:
        "3 %. Bruttosoliditeten jämför primärkapitalet med de totala exponeringarna utan riskvikter. Den fungerar som ett golv om riskvikterna skulle vara för låga.",
    },
    {
      id: "q13",
      type: "mc",
      text: "Vilket likviditetsmått visar om vi klarar 30 dagars stressade utflöden?",
      options: ["NSFR", "LCR", "CET1", "ROE"],
      correct: 1,
      explanation:
        "LCR (Liquidity Coverage Ratio) ska vara minst 100 %. Likvida tillgångar ska täcka nettoutflödena under 30 stressade dagar. NSFR mäter den stabila finansieringen på ett års sikt.",
    },
    {
      id: "q14",
      type: "tf",
      text: "Med tillstånd kan vi ta emot inlåning från allmänheten som omfattas av den statliga insättningsgarantin.",
      correct: true,
      explanation:
        "Sant. Insättningsgarantin täcker upp till 1 050 000 kr per person och institut. Det ger en stabil och billig finansiering, men ställer också krav på likviditetshanteringen.",
    },
    {
      id: "q15",
      type: "mc",
      text: "Hur stort startkapital krävs minst för att få tillstånd som bank?",
      options: ["500 000 kr", "1 miljon euro", "5 miljoner euro", "50 miljoner euro"],
      correct: 2,
      explanation: "Ett belopp i kronor som motsvarar minst 5 miljoner euro.",
    },
  ],
};
