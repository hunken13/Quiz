// Frågorna som visas i quizet. Rätta svar ligger INTE här utan i private/answer-key.js
// (och i Supabase-tabellen question_keys). Typer: mc = flerval, tf = sant/falskt, estimate = skattning.

window.QUIZ = {
  "title": "Från konsumentkreditinstitut till bank",
  "subtitle": "Hur bra koll har du på kapitaltäckning?",
  "questions": [
    {
      "id": "q1",
      "type": "mc",
      "text": "Vad handlar kapitaltäckning om i grunden?",
      "options": [
        "Att alla insättningar alltid finns kvar som kontanter",
        "Att bolaget har tillräckligt med eget kapital i förhållande till riskerna i tillgångarna",
        "Att alla lån är försäkrade mot kreditförluster",
        "Att bolaget går med vinst varje kvartal"
      ]
    },
    {
      "id": "q2",
      "type": "tf",
      "text": "Som konsumentkreditinstitut omfattas vi redan i dag av samma kapitaltäckningsregler (CRR) som en bank."
    },
    {
      "id": "q3",
      "type": "mc",
      "text": "Vilken EU-förordning innehåller de grundläggande kapitalkraven för banker?",
      "options": [
        "GDPR",
        "MiFID II",
        "CRR",
        "PSD2"
      ]
    },
    {
      "id": "q4",
      "type": "mc",
      "text": "Hur stort är det totala minimikravet på kapital i pelare 1, räknat på det riskvägda exponeringsbeloppet?",
      "options": [
        "3 %",
        "4,5 %",
        "8 %",
        "12 %"
      ]
    },
    {
      "id": "q5",
      "type": "mc",
      "text": "Vilken riskvikt får ett vanligt blancolån till en privatperson enligt schablonmetoden?",
      "options": [
        "0 %",
        "35 %",
        "75 %",
        "100 %"
      ]
    },
    {
      "id": "q6",
      "type": "estimate",
      "text": "Vi har 1 000 Mkr i blancolån som inte har fallerat. Hur stort blir det riskvägda exponeringsbeloppet?",
      "unit": "Mkr"
    },
    {
      "id": "q7",
      "type": "estimate",
      "text": "Med 750 Mkr i riskvägt exponeringsbelopp: hur mycket kapital krävs minst för att klara pelare 1-kravet på 8 %?",
      "unit": "Mkr"
    },
    {
      "id": "q8",
      "type": "mc",
      "text": "Vilken av följande poster räknas INTE in i kärnprimärkapitalet utan dras av från det?",
      "options": [
        "Aktiekapital",
        "Balanserade vinstmedel",
        "Överkursfond",
        "Aktiverade utvecklingsutgifter (immateriella tillgångar)"
      ]
    },
    {
      "id": "q9",
      "type": "tf",
      "text": "Kapitalkonserveringsbufferten är 2,5 % och ska bestå av kärnprimärkapital."
    },
    {
      "id": "q10",
      "type": "mc",
      "text": "Vad handlar pelare 2 om?",
      "options": [
        "Offentliggörande av information om risker och kapital",
        "Finansinspektionens bedömning av bolagets specifika risker och eventuella extra kapitalkrav",
        "Insättningsgarantin",
        "Minimikravet på 8 %"
      ]
    },
    {
      "id": "q11",
      "type": "mc",
      "text": "Vad kallas bolagets egen bedömning av hur mycket kapital och likviditet det behöver?",
      "options": [
        "SREP",
        "IKLU",
        "KYC",
        "LCR"
      ]
    },
    {
      "id": "q12",
      "type": "mc",
      "text": "Vilket minimikrav gäller för bruttosoliditet (leverage ratio)?",
      "options": [
        "1 %",
        "3 %",
        "8 %",
        "10 %"
      ]
    },
    {
      "id": "q13",
      "type": "mc",
      "text": "Vilket likviditetsmått visar om vi klarar 30 dagars stressade utflöden?",
      "options": [
        "NSFR",
        "LCR",
        "CET1",
        "ROE"
      ]
    },
    {
      "id": "q14",
      "type": "tf",
      "text": "Med tillstånd kan vi ta emot inlåning från allmänheten som omfattas av den statliga insättningsgarantin."
    },
    {
      "id": "q15",
      "type": "mc",
      "text": "Hur stort startkapital krävs minst för att få tillstånd som bank?",
      "options": [
        "500 000 kr",
        "1 miljon euro",
        "5 miljoner euro",
        "50 miljoner euro"
      ]
    }
  ]
};
